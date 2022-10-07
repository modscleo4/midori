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

export enum ContentSecurityPolicyValue {
    NONE = "'none'",
    SELF = "'self'",
    STRICT_DYNAMIC = "'strict-dynamic'",
    REPORT_SAMPLE = "'report-sample'",
    UNSAFE_INLINE = "'unsafe-inline'",
    UNSAFE_EVAL = "'unsafe-eval'",
    UNSAFE_HASHES = "'unsafe-hashes'",
    UNSAFE_ALLOW_REDIRECTS = "'unsafe-allow-redirects'",
    ANY = "*",
}

/**
 * Provides a middleware for Content-Security-Policy setup.
 */
export default function ContentSecurityPolicyMiddleware(
    options?: {
        connect?: string;
        default?: string;
        font?: string;
        frame?: string;
        img?: string;
        manifest?: string;
        media?: string;
        object?: string;
        prefetch?: string;
        script?: string;
        scriptElem?: string;
        scriptAttr?: string;
        style?: string;
        styleElem?: string;
        styleAttr?: string;
        worker?: string;
    }
): Constructor<Middleware> {
    const csp: string[] = [];

    if (options?.connect) {
        csp.push(`connect-src ${options.connect}`);
    }

    if (options?.default) {
        csp.push(`default-src ${options.default}`);
    }

    if (options?.font) {
        csp.push(`font-src ${options.font}`);
    }

    if (options?.frame) {
        csp.push(`frame-src ${options.frame}`);
    }

    if (options?.img) {
        csp.push(`img-src ${options.img}`);
    }

    if (options?.manifest) {
        csp.push(`manifest-src ${options.manifest}`);
    }

    if (options?.media) {
        csp.push(`media-src ${options.media}`);
    }

    if (options?.object) {
        csp.push(`object-src ${options.object}`);
    }

    if (options?.prefetch) {
        csp.push(`prefetch-src ${options.prefetch}`);
    }

    if (options?.script) {
        csp.push(`script-src ${options.script}`);
    }

    if (options?.scriptElem) {
        csp.push(`script-src-elem ${options.scriptElem}`);
    }

    if (options?.scriptAttr) {
        csp.push(`script-src-attr ${options.scriptAttr}`);
    }

    if (options?.style) {
        csp.push(`style-src ${options.style}`);
    }

    if (options?.styleElem) {
        csp.push(`style-src-elem ${options.styleElem}`);
    }

    if (options?.styleAttr) {
        csp.push(`style-src-attr ${options.styleAttr}`);
    }

    if (options?.worker) {
        csp.push(`worker-src ${options.worker}`);
    }

    return class extends Middleware {
        async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
            const res = await next(req);

            return res.withHeader('Content-Security-Policy', csp.join('; '));
        }
    };
}
