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
import { EStatusCode } from "../http/EStatusCode.js";
import Middleware from "../http/Middleware.js";
import type Request from "../http/Request.js";
import Response from "../http/Response.js";
import { type ErrorConfig, ErrorConfigProvider } from "../providers/ErrorConfigProvider.js";
import { parseStack } from "../util/error.js";

export class ErrorMiddleware extends Middleware {
    #options: ErrorConfig | undefined;

    constructor(app: Application) {
        super(app);

        this.#options = app.config.get(ErrorConfigProvider);
    }

    get options(): ErrorConfig | undefined {
        return this.#options;
    }

    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        try {
            return await next(req);
        } catch (e) {
            // The status code for a server error is 500
            const response = Response.status(EStatusCode.INTERNAL_SERVER_ERROR);
            if ((this.options?.exposeErrors ?? false) && e instanceof Error) {
                response.problem(
                    e.message,
                    e.stack ?? '',
                    EStatusCode.INTERNAL_SERVER_ERROR,
                    null,
                    req.path,
                    { method: req.method, stack: parseStack(e) }
                );
            }

            return response;
        }
    }
}

/**
 * Middleware to handle any uncaught error, sending a 500 response with the error info, if set to expose errors.
 */
export default function ErrorMiddlewareFactory(options: ErrorConfig): typeof ErrorMiddleware {
    return class extends ErrorMiddleware {
        override get options(): ErrorConfig {
            return options;
        }
    };
}
