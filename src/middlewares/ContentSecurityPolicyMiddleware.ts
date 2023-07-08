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

import { Application } from "../app/Server.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import { ContentSecurityPolicyConfig, ContentSecurityPolicyValue, ContentSecurityPolicyConfigProvider } from "../providers/ContentSecurityPolicyConfigProvider.js";

export class ContentSecurityPolicyMiddleware extends Middleware {
    #options?: ContentSecurityPolicyConfig;

    constructor(app: Application) {
        super(app);

        this.#options = app.config.get(ContentSecurityPolicyConfigProvider);
    }

    get options(): ContentSecurityPolicyConfig | undefined {
        return this.#options;
    }

    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const csp: string[] = [];

        if (this.options?.connect) {
            csp.push(`connect-src ${this.options.connect}`);
        }

        if (this.options?.default) {
            csp.push(`default-src ${this.options.default}`);
        }

        if (this.options?.font) {
            csp.push(`font-src ${this.options.font}`);
        }

        if (this.options?.frame) {
            csp.push(`frame-src ${this.options.frame}`);
        }

        if (this.options?.img) {
            csp.push(`img-src ${this.options.img}`);
        }

        if (this.options?.manifest) {
            csp.push(`manifest-src ${this.options.manifest}`);
        }

        if (this.options?.media) {
            csp.push(`media-src ${this.options.media}`);
        }

        if (this.options?.object) {
            csp.push(`object-src ${this.options.object}`);
        }

        if (this.options?.prefetch) {
            csp.push(`prefetch-src ${this.options.prefetch}`);
        }

        if (this.options?.script) {
            csp.push(`script-src ${this.options.script}`);
        }

        if (this.options?.scriptElem) {
            csp.push(`script-src-elem ${this.options.scriptElem}`);
        }

        if (this.options?.scriptAttr) {
            csp.push(`script-src-attr ${this.options.scriptAttr}`);
        }

        if (this.options?.style) {
            csp.push(`style-src ${this.options.style}`);
        }

        if (this.options?.styleElem) {
            csp.push(`style-src-elem ${this.options.styleElem}`);
        }

        if (this.options?.styleAttr) {
            csp.push(`style-src-attr ${this.options.styleAttr}`);
        }

        if (this.options?.worker) {
            csp.push(`worker-src ${this.options.worker}`);
        }

        const res = await next(req);

        return res.withHeader('Content-Security-Policy', csp.join('; '));
    }
}

/**
 * Provides a middleware for Content-Security-Policy setup.
 */
export default function ContentSecurityPolicyMiddlewareFactory(options: ContentSecurityPolicyConfig): typeof ContentSecurityPolicyMiddleware {
    return class extends ContentSecurityPolicyMiddleware {
        get options(): ContentSecurityPolicyConfig {
            return options;
        }
    };
}
