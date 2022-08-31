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

import Brotli from "../util/compression/brotli.js";
import Gzip from "../util/compression/gzip.js";
import Deflate from "../util/compression/deflate.js";

export enum CompressionAlgorithm {
    GZIP = 'gzip',
    DEFLATE = 'deflate',
    BROTLI = 'br',
    IDENTITY = 'identity',
}

function parseAcceptEncoding(acceptEncoding: string): string[] {
    const algorithms = acceptEncoding.split(',').map((algorithm) => {
        const [alg, q] = algorithm.split(';');
        return {
            alg: alg.trim() as CompressionAlgorithm,
            q: q ? parseFloat(q.replace('q=', '')) : 1,
        };
    });

    algorithms.sort((a, b) => b.q - a.q);

    return algorithms.map((a) => a.alg);
}

function globMatch(pattern: string, search: string): boolean {
    const regex = new RegExp(
        pattern
            .split('*')
            .map((part) => part.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
            .join('.*'),
        'i',
    );

    return regex.test(search);
}

/**
 * Compress the response body using the best algorithm available, based on the request Accept-Encoding header.
 */
export default function ResponseCompressionMiddleware(options?: { contentTypes?: string[], defaultAlgorithm?: CompressionAlgorithm; }): Constructor<Middleware> {
    return class extends Middleware {
        async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
            const res = await next(req);

            const contentTypes = options?.contentTypes ?? ['*/*'];

            if (contentTypes.find((c) => globMatch(c, '' + res.headers.get('Content-Type')))) {
                const header = req.headers['accept-encoding'];
                if (!header) {
                    return res;
                }

                const algorithm = (header === '*')
                    ? options?.defaultAlgorithm ?? CompressionAlgorithm.BROTLI
                    : parseAcceptEncoding(Array.isArray(header) ? header.at(-1) ?? '' : header)[0];

                if (!algorithm) {
                    return res;
                }

                res.withHeader('Content-Encoding', algorithm);

                switch (algorithm) {
                    case CompressionAlgorithm.GZIP:
                        res.bodyBuffer = [await Gzip.compress(Buffer.concat(res.bodyBuffer))];
                        break;

                    case CompressionAlgorithm.DEFLATE:
                        res.bodyBuffer = [await Deflate.compress(Buffer.concat(res.bodyBuffer))];
                        break;

                    case CompressionAlgorithm.BROTLI:
                        res.bodyBuffer = [await Brotli.compress(Buffer.concat(res.bodyBuffer))];
                        break;
                }
            }

            return res;
        }
    };
}
