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
import type Auth from "../auth/Auth.js";
import { EStatusCode } from "../http/EStatusCode.js";
import Middleware from "../http/Middleware.js";
import type Request from "../http/Request.js";
import Response from "../http/Response.js";
import AuthServiceProvider from "../providers/AuthServiceProvider.js";
import { split } from "../util/strings.js";
import AuthMiddleware from "./AuthMiddleware.js";

/**
 * Provides a middleware for authentication using Basic Authentication.
 */
export default class AuthBasicMiddleware extends Middleware {
    #auth: Auth;

    constructor(app: Application) {
        super(app);

        this.#auth = app.services.get(AuthServiceProvider);
    }

    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const authInfo = this.getAuthInfo(req);
        if (!authInfo) {
            req.container.set(AuthMiddleware.MethodKey, 'Basic');
            return await next(req);
        }

        const { scheme, credentials } = authInfo;

        if (scheme !== 'Basic') {
            return Response.problem('Invalid Authorization scheme.', 'Only Basic scheme is supported.', EStatusCode.UNAUTHORIZED)
                .withHeader('WWW-Authenticate', 'Basic');
        }

        if (!credentials) {
            return Response.problem('Invalid Authorization credentials.', 'No credentials provided.', EStatusCode.UNAUTHORIZED)
                .withHeader('WWW-Authenticate', 'Basic');
        }

        const [username, password] = Buffer.from(credentials, 'base64').toString('utf8').split(':');

        if (
            !username
            || !password
        ) {
            return Response.problem('Invalid Authorization credentials.', 'Invalid username or password provided (is it base64 encoded?).', EStatusCode.UNAUTHORIZED)
                .withHeader('WWW-Authenticate', 'Basic');
        }

        try {
            await this.#auth.authenticate(req, username, password);
        } catch (e) {
            return Response.problem('Invalid Authorization credentials.', 'Could not authenticate with username or password provided.', EStatusCode.UNAUTHORIZED)
                .withHeader('WWW-Authenticate', 'Basic');
        }

        return await next(req);
    }

    /**
     * Extracts the Authorization header from the Request.
     *
     * @param req Request object.
     * @returns An object with the scheme and credentials or null if the header is not present.
     */
    getAuthInfo(req: Request): { scheme: string, credentials: string; } | null {
        if (!req.headers.authorization) {
            return null;
        }

        const [scheme, credentials] = split(req.headers.authorization, ' ', 2);

        return { scheme, credentials };
    }
}
