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
 * Route representation.
 *
 * This class is used internally by the Router and is instantiated by the Router itself.
 */
export default class Route {
    #method: string;
    #path: string;
    #handler: HandlerConstructor | HandlerFunction;
    #middlewares: (MiddlewareConstructor | MiddlewareFunction)[];
    #cachedHandler?: HandlerFunction;
    #cachedMiddlewares: MiddlewareFunction[];
    #name: string | undefined;

    constructor(method: string, path: string, handler: HandlerConstructor | HandlerFunction, middlewares: (MiddlewareConstructor | MiddlewareFunction)[], name?: string) {
        this.#method = method;
        this.#path = path;
        this.#handler = handler;
        this.#middlewares = middlewares;
        this.#name = name;

        this.#cachedMiddlewares = Array.from({ length: this.#middlewares.length });
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
    cacheHandler(app: Application): HandlerFunction {
        if (!this.#cachedHandler) {
            this.#cachedHandler = Handler.asFunction(this.#handler, app);
        }

        return this.#cachedHandler;
    }

    /** @internal */
    cacheMiddleware(i: number, app: Application): MiddlewareFunction {
        if (!this.#cachedMiddlewares[i]) {
            this.#cachedMiddlewares[i] = Middleware.asFunction(this.#middlewares[i], app);
        }

        return this.#cachedMiddlewares[i];
    }

    /** @internal */
    async handle(req: Request, app: Application): Promise<Response> {
        let index = 0;

        const next = async (req: Request): Promise<Response> => {
            if (index == this.#middlewares.length) {
                // No more middlewares to process

                return await this.cacheHandler(app)(req, app);
            }

            return await this.cacheMiddleware(index++, app)(req, next, app);
        };

        return await next(req);
    }

    /** @internal */
    getParams(path: string): Map<string, string> {
        const parts = path.split('/');
        const routeParts = this.path.split('/');

        const params = new Map<string, string>();

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
