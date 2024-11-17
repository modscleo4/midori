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
import Middleware from "../http/Middleware.js";
import type Request from "../http/Request.js";
import type Response from "../http/Response.js";
import type Route from "../router/Route.js";
import RouterMiddleware from "./RouterMiddleware.js";

/**
 * Dispatches the Request to the Handler from the Router.
 */
export default class DispatchMiddleware extends Middleware {
    constructor(private app: Application) {
        super(app);
    }

    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const route = req.container.get(RouterMiddleware.RouteKey) as Route | null;

        if (!route) {
            return await next(req);
        }

        const params = route.getParams(req.path);
        for (const [param, value] of params) {
            req.params.set(param, value);
        }

        // Handle the request and get the response
        return await route.handle(req, this.app);
    }
}
