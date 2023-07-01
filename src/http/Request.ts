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

import { IncomingMessage } from "node:http";

import Container from "../app/Container.js";

/**
 * Basic class representing a HTTP Request.
 */
export default class Request extends IncomingMessage {
    #query?: URLSearchParams;
    #params = new Map<string, string>();
    #path?: string;
    #body: Buffer[] = [];
    #parsedBody: any = undefined;
    #container?: Container<string, any>;
    #ip?: string;

    static maxBodySize: number = 1024 * 1024;

    /** @internal */
    init(container: Container<string, any>) {
        this.#container = container;

        const url = new URL(this.url ?? '', `http://${this.headers.host}`);

        this.#query = url.searchParams;
        this.#path = url.pathname + (url.pathname.endsWith('/') ? '' : '/');
        this.#ip = (Array.isArray(this.headers['x-real-ip']) ? this.headers['x-real-ip'][0] : this.headers['x-real-ip']) ?? (Array.isArray(this.headers['x-forwarded-for']) ? this.headers['x-forwarded-for'][0] : this.headers['x-forwarded-for']) ?? this.socket.remoteAddress;
    }

    async readBody(): Promise<Buffer> {
        // Wait for the body to be fully read before processing the request
        let len = 0;
        for await (const chunk of this) {
            len += chunk.length;
            if (len > Request.maxBodySize) {
                throw new Error('Max body size exceeded.');
            }

            this.#body.push(chunk);
        }

        return this.body;
    }

    get query() {
        return this.#query!;
    }

    get params() {
        return this.#params;
    }

    get path() {
        return this.#path!;
    }

    get body() {
        return Buffer.concat(this.#body);
    }

    get parsedBody() {
        if (this.#parsedBody === undefined) {
            return this.body;
        }

        return this.#parsedBody;
    }

    /** @internal */
    set parsedBody(value: any) {
        this.#parsedBody = value;
    }

    get container() {
        return this.#container!;
    }

    get ip() {
        return this.#ip;
    }

    [Symbol.asyncIterator](): AsyncIterableIterator<Buffer> {
        return super[Symbol.asyncIterator]();
    }
}
