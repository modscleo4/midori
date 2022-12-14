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

import { ServerResponse, Server as HTTPServer } from "node:http";

import Request from "../http/Request.js";
import Container from "./Container.js";
import { Constructor } from "../util/types.js";
import Middleware from "../http/Middleware.js";
import Response from "../http/Response.js";
import ContentLengthMiddleware from "../middlewares/ContentLengthMiddleware.js";
import UnknownServiceError from "../errors/UnknownServiceError.js";
import ServiceProvider from "./ServiceProvider.js";

class ServiceContainer extends Container<string, any> {
    get(key: string): any {
        if (!this.has(key)) {
            throw new UnknownServiceError(key);
        }

        return super.get(key);
    }
}

interface ReadonlyServiceContainer {
    get<T>(service: typeof ServiceProvider<T>): T;
    has(service: typeof ServiceProvider): boolean;
}

export interface Application {
    readonly services: ReadonlyServiceContainer;

    readonly production: boolean;
}

export default class Server extends HTTPServer implements Application {
    #services = new ServiceContainer();
    #pipeline: Constructor<Middleware>[] = [ContentLengthMiddleware];
    #containerBuilder: () => Container<string, any>;
    #readonlyServices: ReadonlyServiceContainer = {
        get: provider => this.#services.get(provider.service),
        has: provider => this.#services.has(provider.service),
    };
    #production: boolean = false;

    constructor(options?: { containerBuilder?: () => Container<string, any>; production?: boolean }) {
        super({ IncomingMessage: Request }, async (req, res) => await this.process(<Request> req, res));

        this.#containerBuilder = options?.containerBuilder ?? (() => new Container<string, any>());
        this.#production = options?.production ?? false;
    }

    /** @internal */
    async process(req: Request, res: ServerResponse): Promise<void> {
        req.init(this.#containerBuilder());

        try {
            const response = await this.processRequest(req);

            // Send the returning response status code, headers and body to the response
            res.statusCode = response.status;

            for (const [header, value] of response.headers) {
                res.setHeader(header, value);
            }

            // HEAD requests should not have a body
            if (req.method === 'HEAD') {
                res.end();
                return;
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
    async processRequest(request: Request): Promise<Response> {
        let index = 0;

        const next = async (req: Request): Promise<Response> => {
            if (index == this.#pipeline.length) {
                // No more middlewares to process
                throw new Error('No more middlewares to process the request.');
            }

            const middleware = new this.#pipeline[index++](this);

            return await middleware.process(req, next);
        };

        return await next(request);
    }

    /**
     * Applies a middleware before every Request.
     *
     * ContentLengthMiddleware is applied by default before any other Middleware.
     */
    pipe(middleware: Constructor<Middleware>): Server {
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
            throw new Error(`A Service Provider with the name '${name}' already exists.`);
        }

        const instance = new provider(this);

        this.#services.set(name, instance.register(this));

        return this;
    }

    get services() {
        return this.#readonlyServices;
    }

    get production() {
        return this.#production;
    }
}
