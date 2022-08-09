import { createServer, IncomingMessage, ServerResponse, Server as HTTPServer } from 'http';

import Request from "./Request.js";
import Router from '../router/Router.js';
import Logger from '../log/Logger.js';

export default class Server {
    #router: Router;
    #logger: Logger;
    #server: HTTPServer;

    constructor(options: { router: Router, logger: Logger }) {
        this.#router = options.router;
        this.#logger = options.logger;

        this.#server = createServer(async (req, res) => await this.process(req, res));
    }

    async process(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const request = new Request(req);

        try {
            const response = await this.#router.process(request);

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
            this.#logger.error('Unhandled Error', e);

            res.statusCode = 500;
            res.end();
        } finally {
            this.#logger.debug(`${request.method} ${request.path} ${res.statusCode}`);
        }
    }

    listen(port: number = 80): HTTPServer {
        return this.#server.listen(port);
    }
}
