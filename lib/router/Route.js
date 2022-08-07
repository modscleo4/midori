import Handler from "../Handler.js";
import Middleware from "../Middleware.js";
import Request from "../Request.js";
import Response from "../Response.js";

export default class Route {
    /** @type {string} */
    #method;

    /** @type {string} */
    #path;

    /** @type {Handler} */
    #handler;

    /** @type {Middleware[]} */
    #middlewares;

    /** @type {string} */
    #name;

    /**
     *
     * @param {string} method
     * @param {string} path
     * @param {Handler} handler
     * @param {Middleware[]} middlewares
     */
    constructor(method, path, handler, middlewares) {
        this.#method = method;
        this.#path = path + (path.endsWith('/') ? '' : '/');
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
     * @package
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async handle(req) {
        const middlewares = this.#middlewares;
        let index = 0;

        /**
         * @param {Request} req
         * @return {Promise<Response>}
         */
        const next = async req => {
            if (index == middlewares.length) {
                // No more middlewares to process
                return await this.#handler.handle(req);
            }

            return await middlewares[index++].process(req, next);
        };

        return await next(req);
    }

    /**
     *
     * @package
     * @param {string} path
     * @return {Map<string, string>}
     */
    getParams(path) {
        const parts = path.split('/');
        const routeParts = this.path.split('/');

        const params = new Map();

        for (let i = 0; i < parts.length; i++) {
            if (routeParts[i].match(/^\{([^\}]+)\}$/)) {
                params.set(/^\{([^\}]+)\}$/.exec(routeParts[i])?.[1] ?? '', parts[i]);
            }
        }

        return params;
    }

    /**
     *
     * @param {string} name
     * @return {Route}
     */
    withName(name) {
        this.#name = name;

        return this;
    }
}
