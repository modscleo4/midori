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
import { EStatusCode } from "../http/EStatusCode.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";

/**
 * Middleware to parse the request body, returning a 415 if no recognized Content-Type is detected.
 */
export default class ParseBodyMiddleware extends Middleware {
    #parsers: Map<string, (req: Request, encoding: BufferEncoding) => Promise<any>> = new Map();

    constructor(app: Application) {
        super(app);

        this.#parsers.set('application/json', async (req: Request, enc: BufferEncoding = 'utf8'): Promise<any> => {
            return JSON.parse((await req.readBody()).toString(enc));
        });

        this.#parsers.set('application/x-www-form-urlencoded', async (req: Request, enc: BufferEncoding = 'utf8'): Promise<Record<string, string>> => {
            return Object.fromEntries(new URLSearchParams((await req.readBody()).toString(enc)));
        });

        this.#parsers.set('text/plain', async (req: Request, enc: BufferEncoding = 'utf8'): Promise<string> => {
            return (await req.readBody()).toString(enc);
        });

        this.#parsers.set('multipart/form-data', async (req: Request, enc: BufferEncoding = 'utf8'): Promise<Record<string, any>> => {
            const boundary = req.headers['content-type']?.split(';')[1].trim().split('=')[1];
            const body = (await req.readBody()).toString(enc);

            const parts = body.split(`--${boundary}`);
            const data: { [key: string]: any; } = {};

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

    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        try {
            if ('content-type' in req.headers) {
                const contentType = req.headers['content-type']?.split(';')[0].trim().toLowerCase();
                const encoding = <BufferEncoding> 'utf8';

                if (contentType && this.#parsers.has(contentType)) {
                    req.parsedBody = await this.#parsers.get(contentType)!(req, encoding);
                }
            }
        } catch (e) {
            return Response.status(EStatusCode.UNSUPPORTED_MEDIA_TYPE);
        }

        return await next(req);
    }
}
