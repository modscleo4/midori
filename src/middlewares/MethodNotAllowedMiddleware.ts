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

import { EStatusCode } from "../http/EStatusCode.js";
import Middleware from "../http/Middleware.js";
import type Request from "../http/Request.js";
import Response from "../http/Response.js";
import type Route from "../router/Route.js";
import RouterMiddleware from "./RouterMiddleware.js";

/**
 * Middleware to handle any request path that does match a route, but does not match any allowed method.
 */
export default class MethodNotAllowedMiddleware extends Middleware {
    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const routes = req.container.get(RouterMiddleware.RoutesKey) as Route[] | null;
        const route = req.container.get(RouterMiddleware.RouteKey) as Route | null;

        if (routes && routes.length > 0 && !route) {
            return Response.status(EStatusCode.METHOD_NOT_ALLOWED);
        }

        return await next(req);
    }
}
