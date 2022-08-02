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
        const middlewaresInstances = middlewares.map(m => new m());

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
     * @returns
     */
    group(prefix, groupCallback) {
        Router.validatePath(prefix);

        const _prefix = this.#prefix;
        this.#prefix += (this.#prefix === '' ? '' : '/') + prefix;

        groupCallback(this);

        this.#prefix = _prefix;
        return this;
    }

    usePublicPath(path) {
        if (!existsSync(path) || !statSync(path).isDirectory()) {
            throw new Error('Path does not exist or is not a directory.');
        }

        this.#publicPath = path;
    }

    /**
     *
     * @return {Route[]}
     */
    compile() {
        return this.#routes;
    }

    get publicPath() {
        return this.#publicPath;
    }

    static validatePath(path) {
        if (!path.startsWith('/')) {
            throw new Error('Path must start with "/".');
        }
    }
}
