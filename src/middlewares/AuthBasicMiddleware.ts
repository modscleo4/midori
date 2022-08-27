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

/**
 * Provides a middleware for authentication using Basic Authentication.
 */
export default class AuthBasicMiddleware extends Middleware {
    #auth: Auth;

    constructor(server: Server) {
        super(server);

        this.#auth = server.providers.get('Auth');
    }

    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        if (!req.headers['authorization']) {
            return Response.json({ message: 'Invalid Authorization header.' })
                .withHeader('WWW-Authenticate', 'Basic')
                .withStatus(EStatusCode.UNAUTHORIZED);
        }

        const [scheme, credentialsBase64] = req.headers['authorization'].split(' ', 2);

        if (scheme !== 'Basic') {
            return Response.json({ message: 'Invalid Authorization scheme.' })
                .withHeader('WWW-Authenticate', 'Basic')
                .withStatus(EStatusCode.UNAUTHORIZED);
        }

        if (!credentialsBase64) {
            return Response.json({ message: 'Invalid Authorization credentials.' })
                .withHeader('WWW-Authenticate', 'Bearer')
                .withStatus(EStatusCode.UNAUTHORIZED);
        }

        const [username, password] = Buffer.from(credentialsBase64, 'base64').toString('utf-8').split(':');

        if (!(
            username
            && password
        )) {
            return Response.json({ message: 'Invalid Authorization credentials.' })
                .withHeader('WWW-Authenticate', 'Bearer')
                .withStatus(EStatusCode.UNAUTHORIZED);
        }

        try {
            await this.#auth.authenticate(req, username, password);
        } catch (e) {
            return Response.json({ message: 'Invalid Authorization credentials.' })
                .withHeader('WWW-Authenticate', 'Basic')
                .withStatus(EStatusCode.UNAUTHORIZED);
        }

        return await next(req);
    }
}
