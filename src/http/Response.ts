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
import { OutgoingHttpHeader, OutgoingHttpHeaders } from "node:http";
import { Readable, Transform } from "node:stream";
import { lookup } from "mime-types";

import { EStatusCode } from "./EStatusCode.js";
import Request from "./Request.js";
import HTTPError from "../errors/HTTPError.js";

/**
 * Representation of a HTTP Response.
 *
 * @template T The type of the data to be sent.
 */
export default class Response<T = any> {
    #headers = new Map<string, OutgoingHttpHeader>();
    #status: number = EStatusCode.OK;
    #body: Buffer[] = [];
    #stream?: Readable;
    #pipeStreams: Transform[] = [];
    #earlyHints: Map<string, string[]> = new Map();

    static #transformers: Map<string, (data: unknown) => Buffer> = new Map();

    static {
        Response.installTransformer('application/json', (data: unknown): Buffer => {
            return Buffer.from(JSON.stringify(data));
        });

        Response.installTransformer('application/json-bigint', (data: unknown): Buffer => {
            return Buffer.from(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() + 'n' : v));
        });
    }

    /**
     * Add a header to the response.
     */
    withHeader(key: string, value: OutgoingHttpHeader): Response<T> {
        // TODO: Add autocomplete for key.
        this.#headers.set(key, value);

        return this;
    }

    /**
     * Add multiple headers to the response.
     */
    withHeaders(headers: OutgoingHttpHeaders): Response<T> {
        for (const key in headers) {
            const value = headers[key]!;
            this.#headers.set(key, value);
        }

        return this;
    }

    /**
     * Add a cookie to the response. The Set-Cookie header will be set and automatically appended.
     */
    withCookie(key: string, value: string, options?: {
        domain?: string;
        path?: string;
        expires?: Date;
        maxAge?: number;
        secure?: boolean;
        httpOnly?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
    }): Response<T> {
        let cookie = `${key}=${value};`;

        if (options?.domain) {
            cookie += ` Domain=${options.domain};`;
        }

        if (options?.path) {
            cookie += ` Path=${options.path};`;
        }

        if (options?.expires) {
            cookie += ` Expires=${options.expires.toUTCString()};`;
        }

        if (options?.maxAge) {
            cookie += ` Max-Age=${options.maxAge};`;
        }

        if (options?.secure) {
            cookie += ' Secure;';
        }

        if (options?.httpOnly) {
            cookie += ' HttpOnly;';
        }

        if (options?.sameSite) {
            cookie += ` SameSite=${options.sameSite};`;
        }

        if (this.#headers.has('Set-Cookie')) {
            const setCookie = this.#headers.get('Set-Cookie')!;
            if (Array.isArray(setCookie)) {
                setCookie.push(cookie);
            } else {
                this.#headers.set('Set-Cookie', [setCookie as string, cookie]);
            }
        }

        return this;
    }

    /**
     * Add an early hint to the response. It uses the `res.writeEarlyHints` method.
     */
    withEarlyHint(key: string, value: string): Response<T> {
        if (!this.#earlyHints.has(key)) {
            this.#earlyHints.set(key, []);
        }

        this.#earlyHints.get(key)!.push(value);

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

    /**
     * Send JSON data with BigInt support. The Content-Type header will be set to application/json-bigint and the data will automatically be converted to JSON string.
     */
    jsonBigint(data: T): Response<T> {
        this.withHeader('Content-Type', 'application/json-bigint')
            .send(Response.#transformers.get('application/json-bigint')!(data));

        return this;
    }

    auto(data: T, req: Request, order?: string[]): Response<T> {
        const priority = order ?? req.acceptPriority;

        for (const type of priority) {
            if (type.endsWith('/*')) {
                const baseType = type.slice(0, -2);
                const transformers = Array.from(Response.#transformers.keys()).filter(t => t.startsWith(baseType));

                if (transformers.length > 0) {
                    this.withHeader('Content-Type', transformers[0])
                        .send(Response.#transformers.get(transformers[0])!(data));

                    return this;
                }
            } else if (Response.#transformers.has(type)) {
                this.withHeader('Content-Type', type)
                    .send(Response.#transformers.get(type)!(data));

                return this;
            }
        }

        if (priority.includes('*/*')) {
            const transformer = 'application/json';

            this.withHeader('Content-Type', transformer)
                .send(Response.#transformers.get(transformer)!(data));

            return this;
        }

        throw new HTTPError('This server cannot process the requested Content-Type.', EStatusCode.NOT_ACCEPTABLE);
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
        if (this.isStream) {
            return -1;
        }

        return this.#body.reduce((acc, chunk) => acc + chunk.length, 0);
    }

    get isStream() {
        return this.#stream !== undefined || this.#pipeStreams.length > 0;
    }

    get earlyHints(): Record<string, string | string[]> | null {
        if (this.#earlyHints.size == 0) {
            return null;
        }

        const hints: Record<string, string | string[]> = {};

        for (const [key, value] of this.#earlyHints) {
            hints[key] = value;
        }

        return hints;
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
     * Send JSON data with BigInt support. The Content-Type header will be set to application/json-bigint and the data will automatically be converted to JSON string.
     */
    static jsonBigint<T = any>(data: T): Response<T> {
        return new Response<T>()
            .jsonBigint(data);
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

    /**
     * Send an early hint (103) response.
     */
    static earlyHint(key: string, value: string): Response {
        return new Response()
            .withEarlyHint(key, value);
    }

    static installTransformer(type: string, transformer: (data: unknown) => Buffer) {
        Response.#transformers.set(type, transformer);
    }
}
