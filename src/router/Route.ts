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

import { Application } from "../app/Server.js";
import Handler, { HandlerConstructor, HandlerFunction } from "../http/Handler.js";
import Middleware, { MiddlewareConstructor, MiddlewareFunction } from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";

/**
 * Route representation
 */
export default class Route {
    #method: string;
    #path: string;
    #handler: HandlerConstructor | HandlerFunction;
    #middlewares: (MiddlewareConstructor | MiddlewareFunction)[];
    #compiledHandler: Map<Application, HandlerFunction> = new Map();
    #compiledMiddlewares: Map<Application, MiddlewareFunction>[];
    #name?: string;

    constructor(method: string, path: string, handler: HandlerConstructor | HandlerFunction, middlewares: (MiddlewareConstructor | MiddlewareFunction)[]) {
        this.#method = method;
        this.#path = path === '/' ? '' : path;
        this.#handler = handler;
        this.#middlewares = middlewares;
        this.#compiledMiddlewares = Array.from({ length: middlewares.length }, () => new Map());
    }

    get method() {
        return this.#method;
    }

    get path() {
        return this.#path;
    }

    get handler() {
        return this.#handler;
    }

    get middlewares() {
        return this.#middlewares;
    }

    get name() {
        return this.#name;
    }

    /** @internal */
    compileHandler(app: Application): HandlerFunction {
        if (!this.#compiledHandler.has(app)) {
            let compiledHandler: HandlerFunction | undefined;
            if (this.#handler.prototype instanceof Handler) {
                const handler = new (this.#handler as HandlerConstructor)(app);

                compiledHandler = handler.handle.bind(handler);
            } else {
                compiledHandler = this.#handler as HandlerFunction;
            }

            this.#compiledHandler.set(app, compiledHandler);

            return compiledHandler;
        }

        return this.#compiledHandler.get(app)!;
    }

    /** @internal */
    compileMiddleware(i: number, app: Application): MiddlewareFunction {
        if (!this.#compiledMiddlewares[i].has(app)) {
            let compiledMiddleware: MiddlewareFunction | undefined;
            if (this.#middlewares[i].prototype instanceof Middleware) {
                const middleware = new (this.#middlewares[i] as MiddlewareConstructor)(app);

                compiledMiddleware = middleware.process.bind(middleware);
            } else {
                compiledMiddleware = this.#middlewares[i] as MiddlewareFunction;
            }

            this.#compiledMiddlewares[i].set(app, compiledMiddleware);

            return compiledMiddleware;
        }

        return this.#compiledMiddlewares[i].get(app)!;
    }

    /** @internal */
    async handle(req: Request, app: Application): Promise<Response> {
        let index = 0;

        const next = async (req: Request): Promise<Response> => {
            if (index == this.#middlewares.length) {
                // No more middlewares to process

                return await this.compileHandler(app)(req, app);
            }

            return await this.compileMiddleware(index++, app)(req, next, app);
        };

        return await next(req);
    }

    /** @internal */
    getParams(path: string): Map<string, string> {
        const parts = path.split('/');
        const routeParts = this.path.split('/');

        const params = new Map();

        const paramRegex = /^([^\{]*)\{([^\}]+)\}(.*)$/;

        for (let i = 0; i < parts.length; i++) {
            if (paramRegex.test(routeParts[i])) {
                const [, before, param, after] = routeParts[i].match(paramRegex)!;
                const [paramName, paramType] = param.split(':');

                const val = parts[i].substring(before.length, parts[i].length - after.length);

                params.set(paramName, val);
            }
        }

        return params;
    }

    /**
     * Sets the name of the route.
     */
    withName(name: string): Route {
        this.#name = name;

        return this;
    }
}
