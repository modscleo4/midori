import { createServer } from 'http';

import Request from "./Request.js";
import Response from "./Response.js";
import Route from './Route.js';

export default class Server {
    /** @type {Route[]} */
    #routes = [];

    constructor(options) {
        this.#routes = options.routes;

        this.server = createServer(async (req, res) => {
            const request = new Request(req);
            const response = new Response(res);

            try {
                if (!this.#routes.some(r => r.path === request.path)) {
                    response.status(404);
                    return;
                }

                const route = this.#routes.find(route => route.method === request.method && route.path === request.path);

                if (!route) {
                    response.status(405);
                    return;
                }

                try {
                    await route.handle(request, response);
                } catch (e) {
                    console.error(e);
                    response.status(500);
                }
            } finally {
                res.end();
            }
        });;
    }

    listen(port = 80) {
        return this.server.listen(port);
    }
}
