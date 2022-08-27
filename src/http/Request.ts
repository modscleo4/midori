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

import { IncomingMessage, IncomingHttpHeaders } from "http";
import Container from "../app/Container.js";

/**
 * Basic class representing an HTTP Request.
 */
export default class Request {
    #req: IncomingMessage;
    #headers: IncomingHttpHeaders;
    #query: URLSearchParams;
    #params = new Map<string, string>();
    #method: string;
    #path: string;
    #body: string = '';
    #parsedBody: any = undefined;
    #container: Container<string, any>;

    static maxBodySize: number = 1024 * 1024;

    constructor(req: IncomingMessage, container: Container<string, any>) {
        this.#req = req;
        this.#container = container;

        const url = new URL(req.url ?? '', `http://${req.headers.host}`);

        this.#headers = req.headers;
        this.#query = url.searchParams;
        this.#method = req.method ?? '';
        this.#path = url.pathname + (url.pathname.endsWith('/') ? '' : '/');
    }

    /** @internal */
    async readBody(): Promise<void> {
        // Wait for the body to be fully read before processing the request
        await new Promise((resolve, reject) => {
            let len = 0;
            this.#req.on('readable', () => {
                let chunk: Buffer;
                while ((chunk = this.#req.read(1024)) !== null) {
                    len += chunk.length;
                    if (len > Request.maxBodySize) {
                        reject(new Error('Max body size exceeded.'));
                    }

                    this.#body += chunk.toString();
                }
            });

            this.#req.on('end', resolve);
            this.#req.on('error', reject);
        });
    }

    /** @internal */
    parseBody(): void {
        if (!this.#body) {
            return;
        }

        if (this.#headers['content-type']?.startsWith('application/json')) {
            this.#parsedBody = JSON.parse(this.#body);
        } else if (this.#headers['content-type']?.startsWith('application/x-www-form-urlencoded')) {
            const parsed = new URLSearchParams(this.#body);

            const obj: Record<string, string> = {};
            for (const [key, value] of parsed) {
                obj[key] = value;
            }

            this.#parsedBody = obj;
        } /* else if (this.#headers['content-type']?.startsWith('text/xml')) {
            const parser = new DOMParser();
            this.#parsedBody = parser.parseFromString(this.#body, 'text/xml');

            if (this.#parsedBody.documentElement.nodeName === 'parsererror') {
                throw new Error('Invalid XML');
            }
        }*/ else if (this.#headers['content-type']?.startsWith('text/plain')) {
            this.#parsedBody = this.#body;
        } else {
            throw new Error('Unsupported content type');
        }
    }

    get headers() {
        return this.#headers;
    }

    get query() {
        return this.#query;
    }

    get params() {
        return this.#params;
    }

    get method() {
        return this.#method;
    }

    /** @internal */
    set method(method: string) {
        this.#method = method;
    }

    get path() {
        return this.#path;
    }

    get body() {
        return this.#body;
    }

    get parsedBody() {
        if (this.#parsedBody === undefined) {
            return this.#body;
        }

        return this.#parsedBody;
    }

    get container() {
        return this.#container;
    }
}
