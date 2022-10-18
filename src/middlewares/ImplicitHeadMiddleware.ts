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

import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import Route from "../router/Route.js";

/**
 * Middleware to handle the HEAD method, returning as a body-less GET request.
 */
export default class ImplicitHeadMiddleware extends Middleware {
    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        if (req.method === 'HEAD') {
            req.method = 'GET';

            const routes: Route[] = req.container.get('::routes');
            const route = routes.find(r => r.method === req.method);

            req.container.set('::route', route);

            req.method = 'HEAD';

            return await next(req);
        }

        return await next(req);
    }
}
