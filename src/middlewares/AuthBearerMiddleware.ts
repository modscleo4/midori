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

import Server from "../app/Server.js";
import Auth from "../auth/Auth.js";
import { EStatusCode } from "../http/EStatusCode.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import JWT from "../jwt/JWT.js";
import AuthServiceProvider from "../providers/AuthServiceProvider.js";
import { JWTServiceProvider } from "../providers/JWTServiceProvider.js";
import { Payload } from "../util/jwt.js";

/**
 * Provides a middleware for authentication using JWT.
 * If the token is valid, it will be stored in the Request container as 'jwt'.
 */
export default class AuthBearerMiddleware extends Middleware {
    #jwt: JWT;
    #auth: Auth;

    constructor(server: Server) {
        super(server);

        this.#jwt = server.services.get(JWTServiceProvider);
        this.#auth = server.services.get(AuthServiceProvider);
    }

    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        if (!req.headers['authorization']) {
            return Response.json({ message: 'Invalid Authorization header.' })
                .withHeader('WWW-Authenticate', 'Bearer')
                .withStatus(EStatusCode.UNAUTHORIZED);
        }

        const [scheme, credentials] = req.headers['authorization'].split(' ', 2);

        if (scheme !== 'Bearer') {
            return Response.json({ message: 'Invalid Authorization scheme.' })
                .withHeader('WWW-Authenticate', 'Bearer')
                .withStatus(EStatusCode.UNAUTHORIZED);
        }

        if (!credentials || !this.#jwt.verify(credentials)) {
            return Response.json({ message: 'Invalid Authorization credentials.' })
                .withHeader('WWW-Authenticate', 'Bearer')
                .withStatus(EStatusCode.UNAUTHORIZED);
        }

        const [, payloadBase64] = credentials.split('.');

        const payload: Payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());

        if (!(
            typeof payload === 'object'
            && payload.sub
            && payload.exp
            && payload.iat
        )) {
            return Response.json({ message: 'Invalid Authorization credentials.' })
                .withHeader('WWW-Authenticate', 'Bearer')
                .withStatus(EStatusCode.UNAUTHORIZED);
        }

        if (payload.exp * 1000 < Date.now()) {
            return Response.json({ message: 'Token has expired.' })
                .withHeader('WWW-Authenticate', 'Bearer')
                .withStatus(EStatusCode.UNAUTHORIZED);
        }

        try {
            await this.#auth.authenticateById(req, payload.sub);
        } catch (e) {
            return Response.json({ message: 'Invalid Authorization credentials.' })
                .withHeader('WWW-Authenticate', 'Bearer')
                .withStatus(EStatusCode.UNAUTHORIZED);
        }

        req.container.set('jwt', payload);

        return await next(req);
    }
}
