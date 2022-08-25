import Handler from "../http/Handler.js";
import Middleware from "../http/Middleware.js";
import Route from "./Route.js";
import { Constructor } from "../util/types.js";

export default class Router {
    #prefix: string = '';
    #middlewares: Constructor<Middleware>[] = [];
    #routes: Route[] = [];
    #publicPath: string | null = null;

    #addRoute(method: string, path: string, handler: Constructor<Handler>, middlewares: Constructor<Middleware>[] = []) {
        Router.validatePath(path);

        const route = new Route(method, this.#prefix + path, handler, middlewares);
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
