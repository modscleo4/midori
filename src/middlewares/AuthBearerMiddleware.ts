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
import type JWT from "../jwt/JWT.js";
import AuthServiceProvider from "../providers/AuthServiceProvider.js";
import JWTServiceProvider from "../providers/JWTServiceProvider.js";
import type { Payload } from "../util/jwt.js";
import { split } from "../util/strings.js";
import AuthMiddleware from "./AuthMiddleware.js";

/**
 * Provides a middleware for authentication using JWT.
 * If the token is valid, it will be stored in the Request container as 'jwt'.
 */
export default class AuthBearerMiddleware extends Middleware {
    #jwt: JWT;
    #auth: Auth;

    static TokenKey: symbol = Symbol('::jwt');

    constructor(app: Application) {
        super(app);

        this.#jwt = app.services.get(JWTServiceProvider);
        this.#auth = app.services.get(AuthServiceProvider);
    }

    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const authInfo = this.getAuthInfo(req);
        if (!authInfo) {
            req.container.set(AuthMiddleware.MethodKey, 'Bearer');
            return await next(req);
        }

        const { scheme, credentials } = authInfo;

        if (scheme !== 'Bearer') {
            return Response.problem('Invalid Authorization header.', 'Only Bearer scheme is supported.', EStatusCode.UNAUTHORIZED)
                .withHeader('WWW-Authenticate', 'Bearer');
        }

        if (!credentials || !this.#jwt.verify(credentials)) {
            return Response.problem('Invalid Authorization header.', 'Invalid token provided.', EStatusCode.UNAUTHORIZED)
                .withHeader('WWW-Authenticate', 'Bearer');
        }

        const [, payloadBase64] = credentials.split('.');

        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());

        if (!await this.validateToken(req, payload)) {
            return Response.problem('Invalid Authorization header.', 'Invalid token provided.', EStatusCode.UNAUTHORIZED)
                .withHeader('WWW-Authenticate', 'Bearer');
        }

        req.container.set(AuthBearerMiddleware.TokenKey, payload);

        return await next(req);
    }

    /**
     * Extracts the Authorization header from the Request.
     *
     * @param req Request object.
     * @returns An object with the scheme and credentials or null if the header is not present.
     */
    getAuthInfo(req: Request): { scheme: string, credentials: string } | null {
        if (!req.headers.authorization) {
            return null;
        }

        const [scheme, credentials] = split(req.headers.authorization, ' ', 2);

        return { scheme, credentials };
    }

    /**
     * Validates the token payload.
     *
     * @param req Request object.
     * @param payload Token payload.
     * @returns True if the token is valid, false otherwise.
     */
    async validateToken(req: Request, payload: Payload): Promise<boolean> {
        if (
            typeof payload !== 'object'
            || !payload.sub
            || !payload.iat
        ) {
            return false;
        }

        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return false;
        }

        const iss = `${req.headers['x-forwarded-proto'] ?? 'http'}://${req.headers.host}`;
        if (payload.aud && Array.isArray(payload.aud) && !payload.aud.includes(iss)) {
            return false;
        }

        if (payload.aud && payload.aud !== iss) {
            return false;
        }

        try {
            await this.#auth.authenticateById(req, payload.sub);
        } catch (e) {
            return false;
        }

        return true;
    }
}
