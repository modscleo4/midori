import Handler from "./Handler.js";
import Middleware from "./Middleware.js";
import Request from "./Request.js";
import Response from "./Response.js";

export default class Route {
    /** @type {string} */
    #method;

    /** @type {string} */
    #path;

    /** @type {Handler} */
    #handler;

    /** @type {Middleware[]} */
    #middlewares;

    constructor(method, path, handler, middlewares) {
        this.#method = method;
        this.#path = path;
        this.#handler = handler;
        this.#middlewares = middlewares;
    }

    get method() {
        return this.#method;
    }

    get path() {
        return this.#path;
    }

    get handler() {
        return this.#handler;
    }

    get middlewares() {
        return this.#middlewares;
    }

    /**
     *
     * @param {Request} req
     * @param {Response} res
     */
    async handle(req, res) {
        if (this.#middlewares.length === 0) {
            await this.#handler.handle(req, res);
            return;
        }

        const middlewares = this.#middlewares;
        let index = 0;

        const next = async () => {
            if (res.sent) { // TODO: handle better this case
                return;
            }

            if (index >= middlewares.length) {
                // No more middlewares to process
                await this.#handler.handle(req, res);
                return;
            }

            await middlewares[index++].process(req, res, next);
        }

        await next();
    }
}

/**
 * @callback RouterGroupCallback
 * @param {RouterWrapper} Router
 */

export class RouterWrapper {
    #prefix = '';
    #routes = [];

    /**
     *
     * @param {string} method
     * @param {string} path
     * @param {typeof Handler} handler
     * @param {typeof Middleware[]} middlewares
     */
    #addRoute(method, path, handler, middlewares = []) {
        RouterWrapper.validatePath(path);

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
        RouterWrapper.validatePath(prefix);

        const _prefix = this.#prefix;
        this.#prefix += (this.#prefix === '' ? '' : '/') + prefix;

        groupCallback(this);

        this.#prefix = _prefix;
        return this;
    }

    /**
     *
     * @return {Route[]}
     */
    compile() {
        return this.#routes;
    }

    static validatePath(path) {
        if (!path.startsWith('/')) {
            throw new Error('Path must start with "/".');
        }
    }
}
