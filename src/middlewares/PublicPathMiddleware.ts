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

import { existsSync, statSync } from "fs";

import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import { Constructor } from "../util/types.js";

export default function PublicPathMiddleware(options: { path: string; }): Constructor<Middleware> {
    return class extends Middleware {
        async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
            // Try to find a matching file in the public directory
            const filename = options.path + (req.path.endsWith('/') ? req.path.substring(0, req.path.length - 1) : req.path);

            if (req.method === 'GET' && existsSync(filename) && statSync(filename).isFile()) {
                return Response.file(filename)
                    .withStatus(200);
            }

            return await next(req);
        }
    };
}
