import { createServer, IncomingMessage, ServerResponse, Server as HTTPServer } from 'http';

import Request from "../http/Request.js";
import RouterProvider from '../router/Router.js';
import LoggerProvider from '../log/Logger.js';
import AuthProvider from '../auth/Auth.js';
import Container from './Container.js';

export default class Server {
    #providers: {
        router: RouterProvider,
        logger: LoggerProvider,
        auth?: AuthProvider;
    };
    #containerBuilder: () => Container;

    #server: HTTPServer;

    constructor(options: { providers: { router: RouterProvider, logger: LoggerProvider, auth?: AuthProvider; }, containerBuilder?: () => Container }) {
        this.#providers = options.providers;
        this.#containerBuilder = options.containerBuilder ?? (() => new Container());

        this.#server = createServer(async (req, res) => await this.process(req, res));
    }

    /** @internal */
    async process(req: IncomingMessage, res: ServerResponse): Promise<void> {
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
            this.logger.error('Unhandled Error', e);

            res.statusCode = 500;
            res.end();
        } finally {
            this.logger.info(`${request.method} ${request.path} ${res.statusCode}`);
        }
    }

    listen(port: number = 80): HTTPServer {
        return this.#server.listen(port);
    }

    stop() {
        return this.#server.close();
    }

    get router() {
        return this.#providers.router;
    }

    get logger() {
        return this.#providers.logger;
    }

    get auth() {
        return this.#providers.auth;
    }
}
