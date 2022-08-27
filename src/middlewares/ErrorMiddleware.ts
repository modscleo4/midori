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
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import { Constructor } from "../util/types.js";

/**
 * Middleware to handle any uncaught error, sending a 500 response with the error info, if set to expose errors.
 */
export default function ErrorMiddleware(options: { exposeErrors?: boolean; }): Constructor<Middleware> {
    return class extends Middleware {
        async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
            try {
                return await next(req);
            } catch (e) {
                // The status code for a server error is 500
                const response = Response.status(EStatusCode.INTERNAL_SERVER_ERROR);
                if ((options?.exposeErrors ?? false) && e instanceof Error) {
                    response.json({ message: e.message, stack: this.parseStack(e.stack ?? '') });
                }

                return response;
            }
        }

        parseStack(stack: string): { method: string, file: string, line: number, column: number; }[] {
            return stack.split('\n').slice(1).map(l => l.trim()).map(l => {
                const { method, file, line, column } = /at ?(?<method>[^ ]*) \(?(?<file>.*):(?<line>\d+):(?<column>\d+)\)?/g.exec(l)?.groups ?? {};

                return {
                    method,
                    file,
                    line: parseInt(line),
                    column: parseInt(column),
                };
            });
        }
    };
}
