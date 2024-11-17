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

import type { Application } from "../app/Server.js";
import type Request from "./Request.js";
import type Response from "./Response.js";

export type MiddlewareFunction = (req: Request, next: (req: Request) => Promise<Response>, app: Application) => Promise<Response>;
export type MiddlewareConstructor = new (app: Application) => Middleware;

/**
 * Middleware is a function that takes a request and returns a response.
 * It sits between the request and the handler, and can be used to implement authentication, logging, etc.
 */
export default abstract class Middleware {
    constructor(app: Application) {
        //
    }

    /**
     * Process a request before it reaches the handler.
     * Here you can do things like authentication, authorization, etc.
     *
     * @param req The request to be processed.
     * @param next The next Middleware (or the Handler) in the chain.
     *
     * @returns The response to the request.
     */
    abstract process(
        req: Request,

        /**
         * Process the next Middleware (or the Handler) in the chain.
         */
        next: (req: Request) => Promise<Response>
    ): Promise<Response>;

    /**
     * Converts a Middleware class to a Middleware function.
     *
     * @param middleware The Middleware class to be converted.
     * @param app The application instance.
     *
     * @returns The Middleware function.
     */
    static asFunction(middleware: MiddlewareConstructor | MiddlewareFunction, app: Application): MiddlewareFunction {
        if (middleware.prototype instanceof Middleware) {
            const instance = new (middleware as MiddlewareConstructor)(app);

            return instance.process.bind(instance);
        }

        return middleware as MiddlewareFunction;
    }
}
