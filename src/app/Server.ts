import { createServer, IncomingMessage, ServerResponse, Server as HTTPServer } from 'http';

import Request from "../http/Request.js";
import { LogColor } from '../log/Logger.js';
import Container from './Container.js';
import { performance } from 'perf_hooks';
import { Constructor } from '../util/types.js';
import Middleware from '../http/Middleware.js';
import Response from '../http/Response.js';
import ContentLengthMiddleware from '../middlewares/ContentLengthMiddleware.js';

export default class Server {
    static #instances: number = 0;

    #providers = new Container({ throwNotFound: true });
    #pipeline: Constructor<Middleware>[] = [ ContentLengthMiddleware ];
    #containerBuilder: () => Container;

    #server: HTTPServer;

    constructor(options?: { containerBuilder?: () => Container }) {
        if (Server.#instances > 0) {
            throw new Error('Only one instance of Server should be created.');
        }

        Server.#instances++;
        this.#containerBuilder = options?.containerBuilder ?? (() => new Container());

        this.#server = createServer(async (req, res) => await this.process(req, res));
    }

    /** @internal */
    async process(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const startTime = performance.now();
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
            this.providers.get('Logger').error('Unhandled Error', { context: e, fgColor: LogColor.LIGHT_RED });

            res.statusCode = 500;
            res.end();
        } finally {
            this.providers.get('Logger').info(`${request.method} ${request.path} ${res.statusCode} (${(performance.now() - startTime).toFixed(2)}ms)`, { fgColor: res.statusCode < 400 ? LogColor.GREEN : res.statusCode < 500 ? LogColor.YELLOW : LogColor.RED });
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
