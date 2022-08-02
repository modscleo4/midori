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
     * @return {Promise<Response>}
     */
    async handle(req) {
        if (this.#middlewares.length === 0) {
            return await this.#handler.handle(req);
        }

        const middlewares = this.#middlewares;
        let index = 0;

        const next = async () => {
            if (index == middlewares.length) {
                // No more middlewares to process
                return;
            }

            return await middlewares[index++].process(req, next);
        }

        const res = await next();
        if (res) {
            return res;
        }

        return await this.#handler.handle(req);
    }
}
