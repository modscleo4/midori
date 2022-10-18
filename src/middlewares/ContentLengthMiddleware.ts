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

/**
 * Middleware to set the Content-Length header of the response.
 */
export default class ContentLengthMiddleware extends Middleware {
    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const res = await next(req);

        // A server MUST NOT send a Content-Length header field in any response with a status code of 1xx (Informational) or 204 (No Content).
        if (res.status >= 200 && res.status !== 204 && !res.headers.has('Content-Length')) {
            if (res.bodyLength > -1) { // The bodyLength is -1 if the body is a stream
                res.headers.set('Content-Length', res.bodyLength);
            } else if (req.method === 'HEAD') { // Calculate Content-Length for HEAD requests
                await new Promise<void>((resolve, reject) => {
                    let bodyLength = 0;
                    const body = res.body;

                    body.on('data', chunk => bodyLength += chunk.length);
                    body.on('close', () => {
                        res.headers.set('Content-Length', bodyLength);
                        resolve();
                    });
                    body.on('error', reject);
                });
            }
        }

        return res;
    }
}
