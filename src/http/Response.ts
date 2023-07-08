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
import Request from "./Request.js";
import HTTPError from "../errors/HTTPError.js";

/**
 * Representation of a HTTP Response.
 *
 * When using the `auto()` method, you can ensure the data type with `T`.
 *
 * @template T The type of the data to be sent.
 */
export default class Response<T = any> {
    #headers = new Map<string, OutgoingHttpHeader>();
    #status: number = EStatusCode.OK;
    #body: Buffer[] = [];
    #stream?: Readable;
    #pipeStreams: Transform[] = [];

    static #transformers: Map<string, (data: any) => Buffer> = new Map();

    static {
        Response.installTransformer('application/json', (data: any): Buffer => {
            return Buffer.from(JSON.stringify(data));
        });
    }

    /**
     * Add a header to the response.
     */
    withHeader(key: string, value: OutgoingHttpHeader): Response<T> {
        this.#headers.set(key, value);

        return this;
    }

    /**
     * Add multiple headers to the response.
     */
    withHeaders(headers: Map<string, OutgoingHttpHeader>): Response<T> {
        for (const [key, value] of headers) {
            this.withHeader(key, value);
        }

        return this;
    }

    /**
     * Send pure data.
     */
    send(data: Buffer): Response<T> {
        this.#body.push(data);

        return this;
    }

    /**
     * Send a stream. Streams have priority over other data.
     */
    stream(stream: Readable): Response<T> {
        this.#stream = stream;

        return this;
    }

    /**
     * Send JSON data. The Content-Type header will be set to application/json and the data will automatically be converted to JSON string.
     */
    json(data: T): Response<T> {
        this.withHeader('Content-Type', 'application/json')
            .send(Response.#transformers.get('application/json')!(data));

        return this;
    }

    auto(data: T, req: Request, order?: string[]): Response<T> {
        const priority = req.acceptPriority;

        for (const [type, transformer] of Response.#transformers) {
            if (priority.includes(type) || priority.includes('*/*') || priority.includes(type.split('/')[0] + '/*')) {
                this.withHeader('Content-Type', type)
                    .send(Buffer.from(transformer(data)));

                    return this;
            }
        }

        throw new HTTPError('Not Acceptable', EStatusCode.NOT_ACCEPTABLE);
    }

    /**
     * Send a File. The Content-Type header will be set based on the filename. The file will be streamed.
     */
    file(filename: string): Response<T> {
        this.withHeader('Content-Type', lookup(filename) || 'text/plain')
            .stream(createReadStream(filename));

        return this;
    }

    /**
     * Set the status code of the response.
     */
    withStatus(code: number): Response<T> {
        this.#status = code;

        return this;
    }

    empty(): Response<T> {
        this.#body = [];

        return this;
    }

    /**
     * Pipe the response to a Transform stream.
     */
    pipe(stream: Transform): Response<T> {
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

        let stream = sourceStream;

        for (const transform of this.#pipeStreams) {
            stream = stream.pipe(transform);
        }

        return stream;
    }

    get length() {
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
    static json<T = any>(data: T): Response<T> {
        return new Response<T>()
            .json(data);
    }

    /**
     * Send data based on the Accept header of the request. The Content-Type header will be set accordingly.
     */
    static auto<T = any>(data: T, req: Request, order?: string[]): Response<T> {
        return new Response<T>()
            .auto(data, req, order);
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

    /**
     * Send a redirect (302) response.
     */
    static redirect(to: string): Response {
        return new Response()
            .withStatus(EStatusCode.FOUND)
            .withHeader('Location', to);
    }

    /**
     * Send a permanent redirect (301) response.
     */
    static redirectPermanent(to: string): Response {
        return new Response()
            .withStatus(EStatusCode.MOVED_PERMANENTLY)
            .withHeader('Location', to);
    }

    static installTransformer(type: string, transformer: (data: any) => Buffer) {
        Response.#transformers.set(type, transformer);
    }
}
