/**
 * Copyright 2022 Dhiego Cassiano Fogaça Barbosa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Server as HTTPServer, ServerResponse } from "node:http";

import UnknownServiceError from "../errors/UnknownServiceError.js";
import Middleware, { MiddlewareConstructor, MiddlewareFunction } from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import ContentLengthMiddleware from "../middlewares/ContentLengthMiddleware.js";
import { Constructor } from "../util/types.js";
import ConfigProvider from "./ConfigProvider.js";
import Container from "./Container.js";
import ServiceProvider from "./ServiceProvider.js";
import Task, { TaskConstructor, TaskFunction } from "../scheduler/Task.js";
import { CronExpression, canRunTask, parseCronString, validateCronString } from "../util/cron.js";

class ServiceContainer extends Container<string, any> {
    get(key: string): any {
        if (!this.has(key)) {
            throw new UnknownServiceError(key);
        }

        return super.get(key)!;
    }
}

interface ReadonlyServiceContainer {
    get<T>(provider: typeof ServiceProvider<T>): T;
    has<T>(provider: typeof ServiceProvider<T>): boolean;
}

interface ReadonlyConfigContainer {
    get<T>(provider: typeof ConfigProvider<T>): T | undefined;
    has(provider: typeof ConfigProvider): boolean;
}

export interface Application {
    readonly services: ReadonlyServiceContainer;
    readonly config: ReadonlyConfigContainer;

    readonly production: boolean;
}

type ServerConfig = {
    production?: boolean;
};

export default class Server extends HTTPServer<typeof Request> implements Application {
    #config = new Container<string, any>();
    #services = new ServiceContainer();
    #pipeline: (MiddlewareConstructor | MiddlewareFunction)[] = [ContentLengthMiddleware];
    #tasks: { cronExpression: CronExpression; runner: TaskFunction; lastRun?: Date }[] = [];

    #compiledPipeline: MiddlewareFunction[] = [];
    #readonlyServices: ReadonlyServiceContainer = {
        get: provider => this.#services.get(provider.service),
        has: provider => this.#services.has(provider.service),
    };
    #readonlyConfig: ReadonlyConfigContainer = {
        get: provider => this.#config.get(provider.config),
        has: provider => this.#config.has(provider.config),
    };

    #production: boolean = false;
    #taskInterval: NodeJS.Timeout;

    constructor(options?: ServerConfig) {
        super({ IncomingMessage: Request }, async (req, res) => await this.process(req, res));

        this.#production = options?.production ?? false;
        this.#taskInterval = setInterval(() => this.runAllTasks(), 500);
    }

    /** @internal */
    async process(req: Request, res: ServerResponse): Promise<void> {
        req.init(this);

        try {
            const response = await this.processRequest(req);

            // Send the returning response status code, headers and body to the response
            res.statusCode = response.status;

            for (const [header, value] of response.headers) {
                res.setHeader(header, value);
            }

            response.body.pipe(res, { end: true });
        } catch (e) {
            // A unhandled error occurred, so we need to log it to the console
            console.error(e);

            res.statusCode = 500;
            res.end();
        }
    }

    /** @internal */
    compilePipeline(i: number): MiddlewareFunction {
        if (!this.#compiledPipeline[i]) {
            if (this.#pipeline[i].prototype instanceof Middleware) {
                const middleware = new (this.#pipeline[i] as MiddlewareConstructor)(this);

                this.#compiledPipeline[i] = middleware.process.bind(middleware);
            } else {
                this.#compiledPipeline[i] = this.#pipeline[i] as MiddlewareFunction;
            }
        }

        return this.#compiledPipeline[i];
    }

    #compileTask(task: TaskConstructor | TaskFunction): TaskFunction {
        if (task.prototype instanceof Task) {
            const instance = new (task as TaskConstructor)(this);

            return instance.run.bind(instance);
        }

        return task as TaskFunction;
    }

    /** @internal */
    async processRequest(request: Request): Promise<Response> {
        let index = 0;

        const next = async (req: Request): Promise<Response> => {
            if (index == this.#pipeline.length) {
                // No more middlewares to process
                throw new Error('No more middlewares to process the request.');
            }

            return await this.compilePipeline(index++)(req, next, this);
        };

        return await next(request);
    }

    /**
     * Applies a middleware before every Request.
     *
     * `ContentLengthMiddleware` is applied by default before any other Middleware.
     */
    pipe(middleware: MiddlewareConstructor | MiddlewareFunction): Server {
        this.#pipeline.push(middleware);

        return this;
    }

    /**
     * Injects a Service Provider into the Server.
     *
     * @throws {Error}
     */
    install<T>(provider: Constructor<ServiceProvider<T>> & { [K in keyof typeof ServiceProvider<T>]: typeof ServiceProvider<T>[K] }): Server {
        const name = provider.service;
        if (this.#services.has(name)) {
            throw new Error(`A Service Provider with the name '${name}' is already installed.`);
        }

        const instance = new provider(this);

        this.#services.set(name, instance.register(this));

        return this;
    }

    /**
     * Removes a Service Provider from the Server.
     *
     * @throws {Error}
     */
    uninstall<T>(provider: Constructor<ServiceProvider<T>> & { [K in keyof typeof ServiceProvider<T>]: typeof ServiceProvider<T>[K] }): Server {
        const name = provider.service;
        if (!this.#services.has(name)) {
            throw new Error(`A Service Provider with the name '${name}' is not installed.`);
        }

        this.#services.delete(name);

        return this;
    }

    /**
     * Injects a Config Provider into the Server.
     *
     * @throws {Error}
     */
    configure<T>(provider: Constructor<ConfigProvider<T>> & { [K in keyof typeof ConfigProvider<T>]: typeof ConfigProvider<T>[K] }): Server {
        const name = provider.config;
        if (this.#config.has(name)) {
            throw new Error(`A Config Provider with the name '${name}' is already installed.`);
        }

        const instance = new provider(this);

        this.#config.set(name, instance.register(this));

        return this;
    }

    /**
     * Schedules a task to be executed periodically.
     *
     * @param cronString A cron string that defines when the task will be executed. Be aware that the seconds field is supported and required.
     * @param task The task to be executed.
     * @throws {Error}
     */
    schedule(cronString: string, task: TaskConstructor | TaskFunction): Server {
        if (!validateCronString(cronString)) {
            throw new Error("Invalid cron string");
        }

        const cronExpression = parseCronString(cronString);

        this.#tasks.push({ cronExpression, runner: this.#compileTask(task) });

        return this;
    }

    async runAllTasks(): Promise<void> {
        const now = new Date();

        for (let i = 0; i < this.#tasks.length; i++) {
            const task = this.#tasks[i];

            if (!canRunTask(task.cronExpression, now, task.lastRun)) {
                continue;
            }

            task.lastRun = now;

            await task.runner(this);
        }
    }

    get services() {
        return this.#readonlyServices;
    }

    get config() {
        return this.#readonlyConfig;
    }

    get production() {
        return this.#production;
    }
}
