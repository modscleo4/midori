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
import { type CORSConfig, CORSConfigProvider } from "../providers/CORSConfigProvider.js";

export class CORSMiddleware extends Middleware {
    #options: CORSConfig | undefined;

    constructor(app: Application) {
        super(app);

        this.#options = app.config.get(CORSConfigProvider);
    }

    get options(): CORSConfig | undefined {
        return this.#options;
    }

    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const res = await next(req);

        if (this.options?.origin) {
            res.withHeader('Access-Control-Allow-Origin', this.options.origin);
        }

        if (this.options?.methods) {
            res.withHeader('Access-Control-Allow-Methods', Array.isArray(this.options.methods) ? this.options.methods.join(', ') : this.options.methods);
        }

        if (this.options?.headers) {
            res.withHeader('Access-Control-Allow-Headers', Array.isArray(this.options.headers) ? this.options.headers.join(', ') : this.options.headers);
        }

        if (this.options?.credentials) {
            res.withHeader('Access-Control-Allow-Credentials', 'true');
        }

        if (this.options?.maxAge) {
            res.withHeader('Access-Control-Max-Age', this.options.maxAge);
        }

        if (this.options?.openerPolicy) {
            res.withHeader('Cross-Origin-Opener-Policy', this.options.openerPolicy);
        }

        if (this.options?.embedderPolicy) {
            res.withHeader('Cross-Origin-Embedder-Policy', this.options.embedderPolicy);
        }

        return res;
    }
}

/**
 * Provides a middleware for CORS setup.
 */
export default function CORSMiddlewareFactory(options: CORSConfig): typeof CORSMiddleware {
    return class extends CORSMiddleware {
        override get options(): CORSConfig {
            return options;
        }
    };
}
