/**
 * @callback RouterGroupCallback
 * @param {Router} Router
 */

import { existsSync, statSync } from 'fs';

import Handler from "./Handler.js";
import Middleware from "./Middleware.js";
import Route from "./Route.js";

export class Router {
    /** @type {string} */
    #prefix = '';

    /** @type {typeof Middleware[]} */
    #middlewares = [];

    /** @type {Route[]} */
    #routes = [];

    /** @type {string?} */
    #publicPath = null;

    /**
     *
     * @param {string} method
     * @param {string} path
     * @param {typeof Handler} handler
     * @param {typeof Middleware[]} middlewares
     */
    #addRoute(method, path, handler, middlewares = []) {
        Router.validatePath(path);

        const handlerInstance = new handler();
        const middlewaresInstances = this.#middlewares.concat(middlewares).map(m => new m());

        const route = new Route(method, this.#prefix + path, handlerInstance, middlewaresInstances);
        this.#routes.push(route);
    }

    /**
     *
     * @param {string} path
     * @param {typeof Handler} handler
     * @param {typeof Middleware[]} middlewares
     * @returns
     */
    get(path, handler, middlewares = []) {
        this.#addRoute('GET', path, handler, middlewares);

        return this;
    }

    /**
     *
     * @param {string} path
     * @param {typeof Handler} handler
     * @param {typeof Middleware[]} middlewares
     * @returns
     */
    post(path, handler, middlewares = []) {
        this.#addRoute('POST', path, handler, middlewares);

        return this;
    }

    /**
     *
     * @param {string} path
     * @param {typeof Handler} handler
     * @param {typeof Middleware[]} middlewares
     * @returns
     */
    put(path, handler, middlewares = []) {
        this.#addRoute('PUT', path, handler, middlewares);

        return this;
    }

    /**
     *
     * @param {string} path
     * @param {typeof Handler} handler
     * @param {typeof Middleware[]} middlewares
     * @returns
     */
    patch(path, handler, middlewares = []) {
        this.#addRoute('PATCH', path, handler, middlewares);

        return this;
    }

    /**
     *
     * @param {string} path
     * @param {typeof Handler} handler
     * @param {typeof Middleware[]} middlewares
     * @returns
     */
    delete(path, handler, middlewares = []) {
        this.#addRoute('DELETE', path, handler, middlewares);

        return this;
    }

    /**
     *
     * @param {string} prefix
     * @param {RouterGroupCallback} groupCallback
     * @param {typeof Middleware[]} middlewares
     * @returns
     */
    group(prefix, groupCallback, middlewares = []) {
        Router.validatePath(prefix);

        const _prefix = this.#prefix;
        const _middlewares = this.#middlewares;
        this.#prefix += prefix;
        this.#middlewares = this.#middlewares.concat(middlewares);

        groupCallback(this);

        this.#prefix = _prefix;
        this.#middlewares = _middlewares;

        return this;
    }

    usePublicPath(path) {
        if (!existsSync(path) || !statSync(path).isDirectory()) {
            throw new Error('Path does not exist or is not a directory.');
        }

        this.#publicPath = path;
    }

    find(path) {
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

    get publicPath() {
        return this.#publicPath;
    }

    static validatePath(path) {
        if (!path.startsWith('/')) {
            // throw new Error('Path must start with "/".');
        }

        return true;
    }
}
