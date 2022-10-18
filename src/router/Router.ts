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

import Handler from "../http/Handler.js";
import Middleware from "../http/Middleware.js";
import Route from "./Route.js";
import { Constructor } from "../util/types.js";

/**
 * Router Helper
 */
export default class Router {
    #prefix: string = '';
    #middlewares: Constructor<Middleware>[] = [];
    #routes: Route[] = [];

    #addRoute(method: string, path: string, handler: Constructor<Handler>, middlewares: Constructor<Middleware>[] = []) {
        Router.validatePath(path);

        const route = new Route(method, this.#prefix + path, handler, this.#middlewares.concat(middlewares));
        this.#routes.push(route);

        return route;
    }

    /**
     * Handle a GET (List) request.
     */
    get(path: string, handler: Constructor<Handler>, middlewares: Constructor<Middleware>[] = []): Route {
        return this.#addRoute('GET', path, handler, middlewares);
    }

    /**
     * Handle a HEAD (Body-less GET) request.
     */
    head(path: string, handler: Constructor<Handler>, middlewares: Constructor<Middleware>[] = []): Route {
        return this.#addRoute('HEAD', path, handler, middlewares);
    }

    /**
     * Handles a POST (Create) request.
     */
    post(path: string, handler: Constructor<Handler>, middlewares: Constructor<Middleware>[] = []): Route {
        return this.#addRoute('POST', path, handler, middlewares);
    }

    /**
     * Handles a PUT (Full Update) request.
     */
    put(path: string, handler: Constructor<Handler>, middlewares: Constructor<Middleware>[] = []): Route {
        return this.#addRoute('PUT', path, handler, middlewares);
    }

    /**
     * Handles a PATCH (Partial Update) request.
     */
    patch(path: string, handler: Constructor<Handler>, middlewares: Constructor<Middleware>[] = []): Route {
        return this.#addRoute('PATCH', path, handler, middlewares);
    }

    /**
     * Handles a DELETE request.
     */
    delete(path: string, handler: Constructor<Handler>, middlewares: Constructor<Middleware>[] = []): Route {
        return this.#addRoute('DELETE', path, handler, middlewares);
    }

    /**
     * Groups routes together. Use this to apply middlewares to a group of routes, or when there are routes with a common path prefix.
     */
    group(prefix: string, groupCallback: (Router: Router) => void, middlewares: Constructor<Middleware>[] = []): void {
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
    static validatePath(path: string): boolean {
        if (!path.startsWith('/')) {
            // throw new Error('Path must start with "/".');
        }

        return true;
    }
}
