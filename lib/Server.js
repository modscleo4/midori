import { existsSync, statSync } from 'fs';
import { readFile } from 'fs/promises';
import { createServer, IncomingMessage, ServerResponse } from 'http';

import Request from "./Request.js";
import { Router } from './Router.js';

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
            const routes = this.#router.find(request.path);

            // Check if a matching route was found
            if (routes.length === 0) {
                // Try to find a matching file in the public directory
                const file = this.#router.publicPath + (request.path.endsWith('/') ? request.path.substring(0, request.path.length - 1) : request.path);

                if (request.method === 'GET' && existsSync(file)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/html');
                    res.setHeader('Content-Length', statSync(file).size);
                    res.write(await readFile(file));
                    res.end();
                    return;
                }

                // The status code for a not found route is 404
                res.statusCode = 404;
                res.end();
                return;
            }

            // OPTIONS requests are always allowed
            if (request.method === 'OPTIONS') {
                // Return the allowed methods for the route
                res.statusCode = 200;
                res.setHeader('Allow', routes.map(r => r.method).join(','));
                res.end();
                return;
            }

            const method = request.method === 'HEAD' ? 'GET' : request.method;

            // Find appropriate route for the request method
            const route = routes.find(route => route.method === method);

            // Check if a matching route was found
            if (!route) {
                // The status code for a unsupported method is 405
                res.statusCode = 405;
                res.end();
                return;
            }

            const params = route.getParams(request.path);
            for (const param of params.keys()) {
                request.params.set(param, params.get(param) ?? '');
            }

            try {
                // Wait for the body to be fully read before processing the request
                await new Promise((resolve, reject) => {
                    req.on('end', resolve);
                    req.on('error', reject);
                });

                // Handle the request and get the response
                const response = await route.handle(request);

                // Send the returning response status code, headers and body to the response
                res.statusCode = response.status;
                for (const header of response.headers.keys()) {
                    res.setHeader(header, response.headers.get(header) ?? '');
                }
                res.setHeader('Content-Length', response.bodyLength);

                // HEAD requests are identical to GET requests, except that the response body is never returned.
                if (request.method !== 'HEAD') {
                    response.body.pipe(res, { end: true });
                } else {
                    res.end();
                }
            } catch (e) {
                console.error(e);

                res.statusCode = 500;
            }
        } finally {
            console.log(`${request.method} ${request.path} ${res.statusCode}`);
        }
    }

    listen(port = 80) {
        return this.server.listen(port);
    }
}
