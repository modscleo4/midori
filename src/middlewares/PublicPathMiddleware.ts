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
import { EStatusCode } from "../http/EStatusCode.js";

import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import { Constructor } from "../util/types.js";

/**
 * Middleware to serve static files from a given directory.
 */
export default function PublicPathMiddleware(options: { path: string; indexFiles?: string[] }): Constructor<Middleware> {
    return class extends Middleware {
        async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
            if (req.method !== 'GET') {
                return await next(req);
            }

            if (req.path === '/') {
                for (const path of options.indexFiles ?? ['index.html']) {
                    const res = await this.tryFile(path);

                    if (res) {
                        return res;
                    }
                }
            } else {
                const res = await this.tryFile(req.path);

                if (res) {
                    return res;
                }
            }

            return await next(req);
        }

        /** @internal */
        async tryFile(path: string): Promise<Response|false> {
            // Try to find a matching file in the public directory
            const filename = options.path + (!path.startsWith('/') ? '/' : '') + (path.endsWith('/') ? path.substring(0, path.length - 1) : path);

            if (existsSync(filename) && statSync(filename).isFile()) {
                return Response.file(filename);
            }

            return false;
        }
    };
}
