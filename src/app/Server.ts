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

import { createServer, IncomingMessage, ServerResponse, Server as HTTPServer } from 'http';

import Request from "../http/Request.js";
import Container from './Container.js';
import { Constructor } from '../util/types.js';
import Middleware from '../http/Middleware.js';
import Response from '../http/Response.js';
import ContentLengthMiddleware from '../middlewares/ContentLengthMiddleware.js';
import UnknownServiceProviderError from '../errors/UnknownServiceProviderError.js';

class ServiceProviderContainer extends Container<string, any> {
    get(key: string): any {
        if (!this.has(key)) {
            throw new UnknownServiceProviderError(key);
        }

        return super.get(key);
    }
}

export default class Server {
    static #instances: number = 0;

    #providers = new ServiceProviderContainer();
    #pipeline: Constructor<Middleware>[] = [ContentLengthMiddleware];
    #containerBuilder: () => Container<string, any>;

    #server: HTTPServer;

    constructor(options?: { containerBuilder?: () => Container<string, any>; }) {
        if (Server.#instances > 0) {
            throw new Error('Only one instance of Server should be created.');
        }

        Server.#instances++;
        this.#containerBuilder = options?.containerBuilder ?? (() => new Container<string, any>());

        this.#server = createServer(async (req, res) => await this.process(req, res));
    }

    /** @internal */
    async process(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const request = new Request(req, this.#containerBuilder());

        try {
            const response = await this.processRequest(request);

            // Send the returning response status code, headers and body to the response
            res.statusCode = response.status;

            for (const [header, value] of response.headers) {
                res.setHeader(header, value);
            }

            response.body.pipe(res, { end: true });
        } catch (e) {
            res.statusCode = 500;
            res.end();
        }
    }

    /**
     * Starts the HTTP server on the specified port.
     */
    listen(port: number = 80): HTTPServer {
        return this.#server.listen(port);
    }

    /**
     * Stops the HTTP server.
     */
    stop(): HTTPServer {
        return this.#server.close();
    }

    /**
     * Applies a middleware before every Request.
     *
     * ContentLengthMiddleware is applied by default before any other Middleware.
     */
    pipe(middleware: Constructor<Middleware>): void {
        this.#pipeline.push(middleware);
    }

    /** @internal */
    async processRequest(request: Request): Promise<Response> {
        let index = 0;

        const next = async (req: Request): Promise<Response> => {
            const middleware = new this.#pipeline[index++](this);

            return await middleware.process(req, next);
        };

        return await next(request);
    }

    /**
     * Injects a Service Provider into the Server by the given name.
     */
    install(name: string, provider: any): void {
        if (this.#providers.has(name)) {
            throw new Error(`A Service Provider with the name '${name}' already exists.`);
        }

        this.#providers.set(name, provider);
    }

    get providers() {
        return this.#providers;
    }
}
