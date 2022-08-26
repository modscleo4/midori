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

export default function ErrorMiddleware(options: { exposeErrors?: boolean; logUnhandledErrors?: boolean; }): Constructor<Middleware> {
    return class extends Middleware {
        async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
            try {
                return await next(req);
            } catch (e) {
                // A unhandled error occurred, so we need to log it to the console since we can't trust the Server has the Logger Service registered
                if (options?.logUnhandledErrors ?? false) {
                    console.error(e);
                }

                // The status code for a server error is 500
                const response = Response.status(500);
                if ((options?.logUnhandledErrors ?? false) && e instanceof Error) {
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
