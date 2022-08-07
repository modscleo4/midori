import { createServer, IncomingMessage, ServerResponse } from 'http';

import Request from "./Request.js";
import Router from './router/Router.js';

export default class Server {
    /** @type {Router} */
    #router;

    constructor(options) {
        this.#router = options.router;

        this.server = createServer(async (req, res) => await this.process(req, res));
    }

    /**
     *
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     * @returns
     */
    async process(req, res) {
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
            console.error(e);

            res.statusCode = 500;
            res.end();
        } finally {
            console.log(`${request.method} ${request.path} ${res.statusCode}`);
        }
    }

    listen(port = 80) {
        return this.server.listen(port);
    }
}
