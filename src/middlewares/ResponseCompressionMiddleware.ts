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

import Brotli from "../util/compression/brotli.js";
import Gzip from "../util/compression/gzip.js";
import Deflate from "../util/compression/deflate.js";
import { CompressionAlgorithm, type ResponseConfig, ResponseConfigProvider } from "../providers/ResponseConfigProvider.js";
import type { Application } from "../app/Server.js";
import { globMatch } from "../util/strings.js";

type ResponseCompressionConfig = ResponseConfig['compression'];

function parseAcceptEncoding(acceptEncoding: string, order: CompressionAlgorithm[]): string[] {
    const algorithms = acceptEncoding.split(',').map((algorithm) => {
        const [alg, q] = algorithm.split(';');
        return {
            alg: alg.trim() as CompressionAlgorithm,
            q: q ? parseFloat(q.replace('q=', '')) : 1,
        };
    });

    function algOrder(a: CompressionAlgorithm, b: CompressionAlgorithm) {
        const aIndex = order.indexOf(a);
        const bIndex = order.indexOf(b);

        if (aIndex === -1 && bIndex === -1) {
            return 0;
        }

        if (aIndex === -1) {
            return 1;
        }

        if (bIndex === -1) {
            return -1;
        }

        return aIndex - bIndex;
    }

    algorithms.sort((a, b) => b.q - a.q || algOrder(a.alg, b.alg));

    return algorithms.map((a) => a.alg);
}

export class ResponseCompressionMiddleware extends Middleware {
    #options?: ResponseCompressionConfig;

    constructor(app: Application) {
        super(app);

        this.#options = app.config.get(ResponseConfigProvider)?.compression;
    }

    get options(): ResponseCompressionConfig | undefined {
        return this.#options;
    }

    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const res = await next(req);

        // If the response is empty or has a Content-Encoding header, do not compress.
        if (
            res.length === 0
            || res.headers.has('Content-Encoding')
            || this.options?.enabled === false
        ) {
            return res;
        }

        const contentTypes = this.options?.contentTypes ?? ['*/*'];

        if (contentTypes.find((c) => globMatch(c, '' + res.headers.get('Content-Type')))) {
            const header = req.headers['accept-encoding'];
            if (!header) {
                return res;
            }

            const algorithm = (header === '*')
                ? this.options?.defaultAlgorithm ?? CompressionAlgorithm.BROTLI
                : parseAcceptEncoding(Array.isArray(header) ? header.at(-1) ?? '' : header, this.options?.order ?? [CompressionAlgorithm.BROTLI, CompressionAlgorithm.GZIP, CompressionAlgorithm.DEFLATE])[0];

            if (!algorithm) {
                return res;
            }

            res.withHeader('Content-Encoding', algorithm);

            switch (algorithm) {
                case CompressionAlgorithm.GZIP:
                    res.pipe(Gzip.compressStream(this.options?.levels?.[CompressionAlgorithm.GZIP]));
                    break;

                case CompressionAlgorithm.DEFLATE:
                    res.pipe(Deflate.compressStream(this.options?.levels?.[CompressionAlgorithm.DEFLATE]));
                    break;

                case CompressionAlgorithm.BROTLI:
                    res.pipe(Brotli.compressStream(this.options?.levels?.[CompressionAlgorithm.BROTLI]));
                    break;
            }
        }

        return res;
    }
}

/**
 * Compress the response body using the best algorithm available, based on the request Accept-Encoding header.
 */
export default function ResponseCompressionMiddlewareFactory(options: ResponseCompressionConfig): typeof ResponseCompressionMiddleware {
    return class extends ResponseCompressionMiddleware {
        override get options(): ResponseCompressionConfig {
            return options;
        }
    };
}
