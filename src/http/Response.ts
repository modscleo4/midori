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

import { createReadStream } from "node:fs";
import { OutgoingHttpHeader } from "node:http";
import { Readable, Transform } from "node:stream";
import { lookup } from "mime-types";

import { EStatusCode } from "./EStatusCode.js";

/**
 * Representation of a HTTP Response.
 */
export default class Response {
    #headers = new Map<string, OutgoingHttpHeader>();
    #status: number = EStatusCode.OK;
    #body: Buffer[] = [];
    #stream?: Readable;
    #pipeStreams: Transform[] = [];

    /**
     * Add a header to the response.
     */
    withHeader(key: string, value: OutgoingHttpHeader): Response {
        this.#headers.set(key, value);

        return this;
    }

    /**
     * Add multiple headers to the response.
     */
    withHeaders(headers: Map<string, OutgoingHttpHeader>): Response {
        for (const [key, value] of headers) {
            this.withHeader(key, value);
        }

        return this;
    }

    /**
     * Send pure data.
     */
    send(data: Buffer): Response {
        this.#body.push(data);

        return this;
    }

    stream(stream: Readable): Response {
        this.#stream = stream;

        return this;
    }

    /**
     * Send JSON data. The Content-Type header will be set to application/json and the data will automatically be converted to JSON string.
     */
    json(data: any): Response {
        this.withHeader('Content-Type', 'application/json')
            .send(Buffer.from(JSON.stringify(data)));

        return this;
    }

    /**
     * Send a File. The Content-Type header will be set based on the filename.
     */
    file(filename: string): Response {
        this.withHeader('Content-Type', lookup(filename) || 'text/plain')
            .stream(createReadStream(filename));

        return this;
    }

    /**
     * Set the status code of the response.
     */
    withStatus(code: number): Response {
        this.#status = code;

        return this;
    }

    empty(): Response {
        this.#body = [];

        return this;
    }

    pipe(stream: Transform): Response {
        this.#pipeStreams.push(stream);

        return this;
    }

    get headers() {
        return this.#headers;
    }

    get status() {
        return this.#status;
    }

    get body(): Readable {
        const sourceStream = this.#stream ?? Readable.from(this.#body);

        if (this.#pipeStreams.length === 0) {
            return sourceStream;
        }

        let stream = sourceStream;

        for (const transform of this.#pipeStreams) {
            stream = stream.pipe(transform);
        }

        return stream;
    }

    get bodyLength() {
        if (this.#stream || this.#pipeStreams.length > 0) {
            return -1;
        }

        return this.#body.reduce((acc, chunk) => acc + chunk.length, 0);
    }

    /**
     * Send pure data.
     */
    static send(data: Buffer): Response {
        return new Response()
            .send(data);
    }

    /**
     * Send JSON data. The Content-Type header will be set to application/json and the data will automatically be converted to JSON string.
     */
    static json(data: any): Response {
        return new Response()
            .json(data);
    }

    /**
     * Send a File. The Content-Type header will be set based on the filename.
     */
    static file(filename: string): Response {
        return new Response()
            .file(filename);
    }

    /**
     * Set the status code of the response.
     */
    static status(code: number): Response {
        return new Response()
            .withStatus(code);
    }

    /**
     * Send a empty (204) response.
     */
    static empty(): Response {
        return new Response()
            .withStatus(EStatusCode.NO_CONTENT);
    }

    static redirect(to: string): Response {
        return new Response()
            .withStatus(EStatusCode.FOUND)
            .withHeader('Location', to);
    }
}
