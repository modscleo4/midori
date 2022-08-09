import { existsSync, statSync } from 'fs';
import { readFile } from 'fs/promises';
import { lookup } from 'mime-types';

import Handler from "../http/Handler.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from '../http/Response.js';
import Route from "./Route.js";

export default class Router {
    #prefix: string = '';
    #middlewares: typeof Middleware[] = [];
    #routes: Route[] = [];
    #publicPath: string | null = null;

    #addRoute(method: string, path: string, handler: new () => Handler, middlewares: (new () => Middleware)[] = []) {
        Router.validatePath(path);

        const handlerInstance = new handler();
        const middlewaresInstances = this.#middlewares.concat(middlewares).map((m: new () => Middleware) => new m());

        const route = new Route(method, this.#prefix + path, handlerInstance, middlewaresInstances);
        this.#routes.push(route);

        return route;
    }

    get(path: string, handler: new () => Handler, middlewares: (new () => Middleware)[] = []): Route {
        return this.#addRoute('GET', path, handler, middlewares);
    }

    post(path: string, handler: new () => Handler, middlewares: (new () => Middleware)[] = []): Route {
        return this.#addRoute('POST', path, handler, middlewares);
    }

    put(path: string, handler: new () => Handler, middlewares: (new () => Middleware)[] = []): Route {
        return this.#addRoute('PUT', path, handler, middlewares);
    }

    patch(path: string, handler: new () => Handler, middlewares: (new () => Middleware)[] = []): Route {
        return this.#addRoute('PATCH', path, handler, middlewares);
    }

    delete(path: string, handler: new () => Handler, middlewares: (new () => Middleware)[] = []): Route {
        return this.#addRoute('DELETE', path, handler, middlewares);
    }

    group(prefix: string, groupCallback: (Router: Router) => void, middlewares: (new () => Middleware)[] = []): void {
        Router.validatePath(prefix);

        const _prefix = this.#prefix;
        const _middlewares = this.#middlewares;
        this.#prefix += prefix;
        this.#middlewares = this.#middlewares.concat(middlewares);

        groupCallback(this);

        this.#prefix = _prefix;
        this.#middlewares = _middlewares;
    }

    /**
     * Applies middlewares to all routes in the group.
     */
    pipeline(middlewares: (new () => Middleware)[]): void {
        this.#middlewares = this.#middlewares.concat(middlewares);
    }

    usePublicPath(path: string): void {
        if (!existsSync(path) || !statSync(path).isDirectory()) {
            throw new Error('Path does not exist or is not a directory.');
        }

        this.#publicPath = path;
    }

    /**
     *
     * @package
     */
    find(path: string): Route[] {
        const routes = this.#routes.filter(r => {
            const parts = path.split('/');
            const routeParts = r.path.split('/');

            if (parts.length !== routeParts.length) {
                return false;
            }

            for (let i = 0; i < parts.length; i++) {
                if (parts[i] !== routeParts[i]) {
                    if (routeParts[i].match(/^\{[^\}]+\}$/)) {
                        continue;
                    }

                    return false;
                }
            }

            return true;
        });

        return routes;
    }

    /**
     *
     * @package
     */
    async process(request: Request): Promise<Response> {
        const routes = this.find(request.path);

        // Check if a matching route was found
        if (routes.length === 0) {
            // Try to find a matching file in the public directory
            const file = this.#publicPath + (request.path.endsWith('/') ? request.path.substring(0, request.path.length - 1) : request.path);

            if (request.method === 'GET' && existsSync(file) && statSync(file).isFile()) {
                return Response.send(await readFile(file))
                    .withHeader('Content-Type', lookup(file) || 'text/plain')
                    .withStatus(200);
            }

            return Response.status(404);
        }

        if (request.method === 'OPTIONS') {
            // OPTIONS requests are always allowed
            return Response.status(200)
                .withHeader('Allow', routes.map(r => r.method).join(','));
        } else if (request.method === 'HEAD') {
            // HEAD requests are identical to GET requests, except that the response body is never returned.
            Response.allowBody(false);
        }

        const method = request.method === 'HEAD' ? 'GET' : request.method;

        // Find appropriate route for the request method
        const route = routes.find(route => route.method === method);

        // Check if a matching route was found
        if (!route) {
            return Response.status(405);
        }

        const params = route.getParams(request.path);
        for (const param of params.keys()) {
            request.params.set(param, params.get(param) ?? '');
        }

        try {
            try {
                await request.readBody();
            } catch (e) {
                return Response.status(413);
            }

            Request.hideHeadMethod(true);

            // Handle the request and get the response
            return await route.handle(request);
        } catch (e) {
            // The status code for a server error is 500
            const response = Response.status(500);
            if (!!process.env.EXPOSE_ERRORS) {
                response.json({ message: e.message, stack: e.stack.split('\n') });
            }

            return response;
        }
    }

    private static validatePath(path: string): boolean {
        if (!path.startsWith('/')) {
            // throw new Error('Path must start with "/".');
        }

        return true;
    }
}
