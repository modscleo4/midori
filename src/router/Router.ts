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

import { HandlerConstructor, HandlerFunction } from "../http/Handler.js";
import { MiddlewareConstructor, MiddlewareFunction } from "../http/Middleware.js";
import { split } from "../util/strings.js";
import { validateUUID } from "../util/uuid.js";
import Route from "./Route.js";

/**
 * Router Helper.
 *
 * Instantiate a new Router instance and use it to define your routes for each Application instance.
 */
export default class Router {
    #prefix: string = '';
    #middlewares: (MiddlewareConstructor | MiddlewareFunction)[] = [];
    #routes: Route[] = [];

    /**
     * Handles a custom method request.
     */
    route(method: string, path: string, handler: HandlerConstructor | HandlerFunction, middlewares: (MiddlewareConstructor | MiddlewareFunction)[] = [], name?: string): Route {
        Router.validatePath(path);

        const route = new Route(method, this.#prefix + path, handler, this.#middlewares.concat(middlewares), name);
        this.#routes.push(route);

        return route;
    }

    /**
     * Handle a GET (List) request.
     */
    get(path: string, handler: HandlerConstructor | HandlerFunction, middlewares: (MiddlewareConstructor | MiddlewareFunction)[] = [], name?: string): Route {
        return this.route('GET', path, handler, middlewares, name);
    }

    /**
     * Handle a HEAD (Body-less GET) request.
     */
    head(path: string, handler: HandlerConstructor | HandlerFunction, middlewares: (MiddlewareConstructor | MiddlewareFunction)[] = [], name?: string): Route {
        return this.route('HEAD', path, handler, middlewares, name);
    }

    /**
     * Handles a POST (Create) request.
     */
    post(path: string, handler: HandlerConstructor | HandlerFunction, middlewares: (MiddlewareConstructor | MiddlewareFunction)[] = [], name?: string): Route {
        return this.route('POST', path, handler, middlewares, name);
    }

    /**
     * Handles a PUT (Full Update) request.
     */
    put(path: string, handler: HandlerConstructor | HandlerFunction, middlewares: (MiddlewareConstructor | MiddlewareFunction)[] = [], name?: string): Route {
        return this.route('PUT', path, handler, middlewares, name);
    }

    /**
     * Handles a PATCH (Partial Update) request.
     */
    patch(path: string, handler: HandlerConstructor | HandlerFunction, middlewares: (MiddlewareConstructor | MiddlewareFunction)[] = [], name?: string): Route {
        return this.route('PATCH', path, handler, middlewares, name);
    }

    /**
     * Handles a DELETE request.
     */
    delete(path: string, handler: HandlerConstructor | HandlerFunction, middlewares: (MiddlewareConstructor | MiddlewareFunction)[] = [], name?: string): Route {
        return this.route('DELETE', path, handler, middlewares, name);
    }

    /**
     * Handles a OPTIONS request.
     */
    options(path: string, handler: HandlerConstructor | HandlerFunction, middlewares: (MiddlewareConstructor | MiddlewareFunction)[] = [], name?: string): Route {
        return this.route('OPTIONS', path, handler, middlewares, name);
    }

    /**
     * Handles a CONNECT request.
     */
    connect(path: string, handler: HandlerConstructor | HandlerFunction, middlewares: (MiddlewareConstructor | MiddlewareFunction)[] = [], name?: string): Route {
        return this.route('CONNECT', path, handler, middlewares, name);
    }

    /**
     * Handles a TRACE request.
     */
    trace(path: string, handler: HandlerConstructor | HandlerFunction, middlewares: (MiddlewareConstructor | MiddlewareFunction)[] = [], name?: string): Route {
        return this.route('TRACE', path, handler, middlewares, name);
    }

    /**
     * Groups routes together. Use this to apply middlewares to a group of routes, or when there are routes with a common path prefix.
     */
    group(prefix: string, groupCallback: (Router: Router) => void, middlewares: (MiddlewareConstructor | MiddlewareFunction)[] = []): void {
        Router.validatePath(prefix);

        const _prefix = this.#prefix;
        const _middlewares = this.#middlewares;
        this.#prefix += prefix;
        this.#middlewares = this.#middlewares.concat(middlewares);

        groupCallback(this);

        this.#prefix = _prefix;
        this.#middlewares = _middlewares;
    }

    /** @internal */
    filter(path: string, method?: string): Route[] {
        const paramRegex = /^([^\{]*)\{([^\}]+)\}(.*)$/;

        const routes = this.#routes.filter(r => {
            const parts = path.split('/');
            const routeParts = r.path.split('/');

            if (parts.length !== routeParts.length) {
                return false;
            }

            for (let i = 0; i < parts.length; i++) {
                if (parts[i] !== routeParts[i]) {
                    if (paramRegex.test(routeParts[i])) {
                        const [, before, param, after] = routeParts[i].match(paramRegex)!;
                        const [paramName, paramType] = split(param, ':', 2);

                        if (!parts[i].startsWith(before) || !parts[i].endsWith(after)) {
                            return false;
                        }

                        const val = parts[i].substring(before.length, parts[i].length - after.length);

                        switch (paramType) {
                            case 'uuidv4':
                                if (!validateUUID(val)) {
                                    return false;
                                }

                                break;

                            case 'uuid':
                                if (!validateUUID(val, -1)) {
                                    return false;
                                }

                                break;

                            case 'number':
                                if (isNaN(Number(val))) {
                                    return false;
                                }

                                break;
                        }

                        continue;
                    }

                    return false;
                }
            }

            if (method && r.method !== method) {
                return false;
            }

            return true;
        });

        return routes;
    }

    /** @internal */
    find(path: string, method: string): Route {
        return this.filter(path, method)[0];
    }

    /** @internal */
    findByName(name: string): Route | null {
        return this.#routes.find(r => r.name === name) ?? null;
    }

    /** @internal */
    static validatePath(path: string): boolean {
        if (path.includes('//')) {
            throw new Error('Path cannot contain double slashes.');
        }

        if (path.includes(' ')) {
            throw new Error('Path cannot contain spaces.');
        }

        if (path.includes('?')) {
            throw new Error('Path cannot contain query strings.');
        }

        return true;
    }

    /**
     * Clone a Router instance and all its routes.
     */
    static clone(router: Router): Router {
        const newRouter = new Router();

        newRouter.#prefix = router.#prefix;
        newRouter.#middlewares = router.#middlewares;
        newRouter.#routes = Array.from({ length: router.#routes.length });

        for (let i = 0; i < router.#routes.length; i++) {
            const route = router.#routes[i];

            newRouter.#routes[i] = new Route(
                route.method,
                route.path,
                route.handler,
                route.middlewares,
                route.name
            );
        }

        return newRouter;
    }
}
