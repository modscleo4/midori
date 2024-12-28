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

import Auth from "../auth/Auth.js";
import { EStatusCode } from "../http/EStatusCode.js";
import Middleware from "../http/Middleware.js";
import type Request from "../http/Request.js";
import Response from "../http/Response.js";

/**
 * Provides a middleware to check if the user is authenticated.
 */
export default class AuthMiddleware extends Middleware {
    static MethodKey: symbol = Symbol('::Auth:Method');

    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        if (!req.container.has(Auth.UserKey)) {
            const res = await this.failedResponse(req);
            const method = req.container.get(AuthMiddleware.MethodKey) as string;
            if (method) {
                return res.withHeader('WWW-Authenticate', method);
            }

            return res;
        }

        return await next(req);
    }

    async failedResponse(req: Request): Promise<Response> {
        return Response.problem('Unauthorized.', 'Authentication is required to access this resource.', EStatusCode.UNAUTHORIZED);
    }
}
