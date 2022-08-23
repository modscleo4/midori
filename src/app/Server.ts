import { createServer, IncomingMessage, ServerResponse, Server as HTTPServer } from 'http';

import Request from "../http/Request.js";
import RouterProvider from '../router/Router.js';
import LoggerProvider, { LogColor } from '../log/Logger.js';
import AuthProvider from '../auth/Auth.js';
import Container from './Container.js';
import { performance } from 'perf_hooks';
import HashProvider from '../hash/Hash.js';

export type Providers = {
    router: RouterProvider,
    logger: LoggerProvider,
    hash: HashProvider,
    auth?: AuthProvider;
};

export default class Server {
    #providers: Providers;
    #containerBuilder: () => Container;

    #server: HTTPServer;

    constructor(options: { providers: Providers, containerBuilder?: () => Container }) {
        this.#providers = options.providers;
        this.#containerBuilder = options.containerBuilder ?? (() => new Container());

        this.#server = createServer(async (req, res) => await this.process(req, res));
    }

    /** @internal */
    async process(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const startTime = performance.now();
        const request = new Request(req, this.#containerBuilder());

        try {
            const response = await this.router.process(request, this);

            // Send the returning response status code, headers and body to the response
            res.statusCode = response.status;

            for (const [header, value] of response.headers) {
                res.setHeader(header, value);
            }

            // A server MUST NOT send a Content-Length header field in any response with a status code of 1xx (Informational) or 204 (No Content).
            if (!(response.status < 200 || response.status === 204)) {
                res.setHeader('Content-Length', response.bodyLength);
            }

            response.body.pipe(res, { end: true });
        } catch (e) {
            this.logger.error('Unhandled Error', { context: e, fgColor: LogColor.LIGHT_RED });

            res.statusCode = 500;
            res.end();
        } finally {
            this.logger.info(`${request.method} ${request.path} ${res.statusCode} (${(performance.now() - startTime).toFixed(2)}ms)`, { fgColor: res.statusCode < 400 ? LogColor.GREEN : res.statusCode < 500 ? LogColor.YELLOW : LogColor.RED });
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
    stop() {
        return this.#server.close();
    }

    get router() {
        return this.#providers.router;
    }

    get logger() {
        return this.#providers.logger;
    }

    get hash() {
        return this.#providers.hash;
    }

    get auth() {
        return this.#providers.auth;
    }
}
