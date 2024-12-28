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
import { ParseBodyConfigProvider, type ParseBodyConfig } from "../providers/ParseBodyConfigProvider.js";

/**
 * Middleware to parse the request body, returning a 415 if no recognized Content-Type is detected.
 *
 * The following Content-Types are recognized by default:
 * - `application/json`
 * - `application/json-bigint`
 * - `application/x-www-form-urlencoded`
 * - `text/csv`
 * - `text/plain`
 * - `multipart/form-data`
 *
 * Install a parser with the method `installParser()`.
 */
export default class ParseBodyMiddleware extends Middleware {
    #options: ParseBodyConfig | undefined;
    #parsers: Map<string, (req: Request, encoding: BufferEncoding) => Promise<unknown>> = new Map();

    constructor(app: Application) {
        super(app);

        this.#options = app.config.get(ParseBodyConfigProvider);

        this.installParser('application/json', async (req: Request, enc: BufferEncoding = 'utf8'): Promise<unknown> => {
            return JSON.parse((await req.readBody()).toString(enc));
        });

        this.installParser('application/json-bigint', async (req: Request, enc: BufferEncoding = 'utf8'): Promise<unknown> => {
            return JSON.parse((await req.readBody()).toString(enc), (key, value) => {
                // Convert strings with the format '123n' to BigInt
                if (typeof value === 'string' && /^\d+n$/.test(value)) {
                    return BigInt(value.slice(0, -1));
                }

                return value;
            });
        });

        this.installParser('application/x-www-form-urlencoded', async (req: Request, enc: BufferEncoding = 'utf8'): Promise<Record<string, string>> => {
            return Object.fromEntries(new URLSearchParams((await req.readBody()).toString(enc)));
        });

        this.installParser('text/plain', async (req: Request, enc: BufferEncoding = 'utf8'): Promise<string> => {
            return (await req.readBody()).toString(enc);
        });

        this.installParser('multipart/form-data', async (req: Request, enc: BufferEncoding = 'utf8'): Promise<Record<string, unknown>> => {
            const boundary = req.headers['content-type']?.split(';')[1].trim().split('=')[1];
            const body = (await req.readBody()).toString(enc);

            const parts = body.split(`--${boundary}`);
            const data: { [key: string]: unknown; } = {};

            for (const part of parts) {
                const lines = part.split('\r\n', 5);

                if (lines.length < 4) {
                    continue;
                }

                const name = lines[1].split(';')[1].split('=')[1].replace(/"/g, '');
                const value = lines[3];

                data[name] = value;
            }

            return data;
        });
    }

    get options(): ParseBodyConfig | undefined {
        return this.#options;
    }

    installParser(contentType: string, parser: (req: Request, encoding: BufferEncoding) => Promise<any>) {
        this.#parsers.set(contentType, parser);
    }

    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        try {
            if ('content-type' in req.headers) {
                const contentType = req.headers['content-type']?.split(';')[0].trim().toLowerCase();
                const encoding = <BufferEncoding> req.headers['content-type']?.split(';')[1]?.trim().split('=')[1] ?? 'utf8';

                if (contentType && this.#parsers.has(contentType)) {
                    req.parsedBody = await this.#parsers.get(contentType)!(req, encoding);
                } else if (this.options?.errorOnUnknownContentType) {
                    return Response.status(EStatusCode.UNSUPPORTED_MEDIA_TYPE);
                }
            }
        } catch (e) {
            return Response.status(EStatusCode.BAD_REQUEST);
        }

        return await next(req);
    }
}
