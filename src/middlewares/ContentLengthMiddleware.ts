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
import type Request from "../http/Request.js";
import type Response from "../http/Response.js";

/**
 * Middleware to set the Content-Length header of the response.
 */
export default class ContentLengthMiddleware extends Middleware {
    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const res = await next(req);

        // A server MUST NOT send a Content-Length header field in any response with a status code of 1xx (Informational) or 204 (No Content).
        if (res.status >= 200 && res.status !== 204 && !res.headers.has('Content-Length')) {
            if (!res.isStream) { // Calculate Content-Length for non-stream responses
                res.headers.set('Content-Length', res.length);
            } else if (req.method === 'HEAD') { // Calculate Content-Length for HEAD requests
                const bodyLength = await new Promise<number>((resolve, reject) => {
                    let len = 0;

                    res.body.on('data', chunk => { len += chunk.length });
                    res.body.on('close', () => {
                        resolve(len);
                    });
                    res.body.on('error', reject);
                });

                res.headers.set('Content-Length', bodyLength);
            }
        }

        return res;
    }
}
