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
import type Logger from "../log/Logger.js";
import { LoggerServiceProvider } from "../providers/LoggerServiceProvider.js";
import { Color } from "../util/ansi.js";

/**
 * Log every unhandled error to the Logger Service.
 */
export default class ErrorLoggerMiddleware extends Middleware {
    #logger: Logger;

    constructor(app: Application) {
        super(app);

        this.#logger = app.services.get(LoggerServiceProvider);
    }

    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        try {
            return await next(req);
        } catch (e) {
            this.#logger.error('An uncaught error occurred while handling a request.', { context: e, format: { color: { fg: Color.RED } } });
            if (e instanceof Error) {
                this.#logger.debug('Stack trace:', { context: e.stack, format: { color: { fg: Color.RED } } });
            }

            throw e;
        }
    }
}
