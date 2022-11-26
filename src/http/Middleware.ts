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
import Request from "./Request.js";
import Response from "./Response.js";

/**
 * Middleware is a function that takes a request and a response and returns a response.
 * It sits between the request and the handler, and can be used to implement authentication, logging, etc.
 */
export default abstract class Middleware {
    constructor(app: Application) {
        //
    }

    /**
     * Middlewares are used to process a request before it reaches the handler.
     * Here you can do things like authentication, authorization, etc.
     */
    abstract process(
        req: Request,

        /**
         * Process the next Middleware (or the Handler) in the chain.
         */
        next: (req: Request) => Promise<Response>
    ): Promise<Response>;
}
