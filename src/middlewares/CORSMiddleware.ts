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
import { Constructor } from "../util/types.js";

/**
 * Provides a middleware for CORS setup.
 */
export default function CORSMiddleware(headers?: { origin?: string; methods?: string; headers?: string; maxAge?: number }): Constructor<Middleware> {
    return class extends Middleware {
        async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
            const res = await next(req);

            return res.withHeader('Access-Control-Allow-Origin', headers?.origin ?? '*')
                .withHeader('Access-Control-Allow-Methods', headers?.methods ?? '*')
                .withHeader('Access-Control-Allow-Headers', headers?.headers ?? '*')
                .withHeader('Access-Control-Max-Age', headers?.maxAge ?? 86400);
        }
    };
}
