import {existsSync} from 'fs';
import {readFile} from 'fs/promises';
import { createServer } from 'http';

import Request from "./Request.js";
import Response from "./Response.js";
import Route from './Route.js';
import {Router} from './Router.js';

export default class Server {
    /** @type {Router} */
    #router;

    /** @type {Route[]} */
    #routes = [];

    constructor(options) {
        this.#router = options.router;
        this.#routes = this.#router.compile();

        this.server = createServer(async (req, res) => {
            const request = new Request(req);

            let end = true;

            try {
                if (!this.#routes.some(r => r.path === request.path)) {
                    if (request.method === 'GET' && existsSync(this.#router.publicPath + (request.path.endsWith('/') ? request.path.substring(0, request.path.length - 1) : request.path))) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/html');
                        res.write(await readFile('public' + request.path));
                        res.end();
                        return;
                    }

                    res.statusCode = 404;
                    return;
                }

                const route = this.#routes.find(route => route.method === request.method && route.path === request.path);

                if (!route) {
                    res.statusCode = 405;
                    return;
                }

                try {
                    const response = await route.handle(request);

                    res.statusCode = response.status;
                    for (const header of response.headers.keys()) {
                        res.setHeader(header, response.headers.get(header) ?? '');
                    }

                    response.body.pipe(res, { end: true });
                    end = false;
                } catch (e) {
                    console.error(e);

                    res.statusCode = 500;
                }
            } finally {
                console.log(`${request.method} ${request.path} ${res.statusCode}`);

                if (end) {
                    res.end();
                }
            }
        });;
    }

    listen(port = 80) {
        return this.server.listen(port);
    }
}
