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
import { Application } from "../app/Server.js";
import { RequestConfig, RequestConfigProvider } from "../providers/RequestConfigProvider.js";
import HTTPError from "../errors/HTTPError.js";
import { EStatusCode } from "./EStatusCode.js";

/**
 * Basic class representing a HTTP Request.
 *
 * If the request body is known, type T can be used to represent it. Please note that this is not a validation, but a type hint.
 *
 * @template T Type of the request body.
 */
export default class Request<T = any> extends IncomingMessage {
    #config?: RequestConfig;

    #query?: URLSearchParams;
    #params: Map<string, string> = new Map<string, string>();
    #path?: string;
    #body: Buffer[] = [];
    #parsedBody?: T = undefined;
    #container?: Container<string, any> = new Container<string, any>();
    #ip?: string;
    #acceptPriority: string[] = [];

    /** @internal */
    init(app: Application) {
        this.#config = app.config.get(RequestConfigProvider);

        const url = new URL(this.url ?? '', `http://${this.headers.host}`);

        this.#query = url.searchParams;
        this.#path = url.pathname;
        this.#ip = this.socket.remoteAddress;
        if (this.headers['x-real-ip']) {
            this.#ip = Array.isArray(this.headers['x-real-ip']) ? this.headers['x-real-ip'][0] : this.headers['x-real-ip'];
        } else if (this.headers['x-forwarded-for']) {
            this.#ip = Array.isArray(this.headers['x-forwarded-for']) ? this.headers['x-forwarded-for'][0] : this.headers['x-forwarded-for'].split(', ')[0];
        }

        this.#parseAcceptPriority();
    }

    async readBody(): Promise<Buffer> {
        // If the body was already read, return it
        if (this.#body.length > 0) {
            return this.body;
        }

        // Wait for the body to be fully read before processing the request
        let len = 0;
        for await (const chunk of this) {
            len += chunk.length;
            if (this.#config && len > this.#config.maxBodySize) {
                throw new HTTPError('Request body too large', EStatusCode.PAYLOAD_TOO_LARGE);
            }

            this.#body.push(chunk);
        }

        return this.body;
    }

    #parseAcceptPriority() {
        if (this.headers.accept === undefined) {
            this.#acceptPriority = ['*/*'];
            return;
        }

        const mimeTypes = this.headers.accept.split(',').map((algorithm) => {
            const [mimeType, q] = algorithm.split(';');
            return {
                mimeType: mimeType.trim(),
                q: q ? parseFloat(q.replace('q=', '')) : 1,
            };
        });

        this.#acceptPriority = mimeTypes.sort((a, b) => b.q - a.q).map(a => a.mimeType);
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

    /**
     * The Request body parsed based on the Content-Type header. If the body is not parsed yet, it will return undefined.
     */
    get parsedBody(): T | undefined {
        return this.#parsedBody;
    }

    /** @internal */
    set parsedBody(value: T) {
        this.#parsedBody = value;
    }

    get container() {
        return this.#container!;
    }

    get ip() {
        return this.#ip;
    }

    get acceptPriority() {
        return this.#acceptPriority;
    }

    [Symbol.asyncIterator](): AsyncIterableIterator<Buffer> {
        return super[Symbol.asyncIterator]();
    }
}
