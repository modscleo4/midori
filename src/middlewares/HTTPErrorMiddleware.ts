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
import HTTPError from "../errors/HTTPError.js";
import { titleFromStatus } from "../http/EStatusCode.js";

/**
 * Catches any HTTPError and returns as a Response.
 */
export default class HTTPErrorMiddleware extends Middleware {
    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        try {
            return await next(req);
        } catch (e) {
            if (e instanceof HTTPError) {
                const res = Response.problem(
                    titleFromStatus(e.status) ?? 'An error occurred',
                    e.message,
                    e.status,
                    null,
                    req.path,
                    e.extra
                );

                if (e.extraHeaders) {
                    res.withHeaders(e.extraHeaders);
                }

                return res;
            }

            throw e;
        }
    }
}
