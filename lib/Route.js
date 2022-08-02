import {ServerResponse} from "http";
import Handler from "./Handler.js";
import Request from "./Request.js";
import Response from "./Response.js";

export default class Route {
    /** @type {string} */
    #method;

    /** @type {string} */
    #path;

    /** @type {Handler|HandlerCallback} */
    #handler;

    constructor(method, path, handler) {
        this.#method = method;
        this.#path = path;
        this.#handler = handler;
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

    async handle(req, res) {
        if (typeof this.#handler === 'function') {
            await this.#handler(req, res);
        } else {
            await this.#handler.handle(req, res);
        }
    }
}

/**
 * @callback RouterGroupCallback
 * @param {RouterWrapper} Router
 */

/**
 * @callback HandlerCallback
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<void>}
 */

export class RouterWrapper {
    #prefix = '';
    #routes = [];

    #addRoute(method, path, handler) {
        RouterWrapper.validatePath(path);

        const route = new Route(method, this.#prefix + path, handler);
        this.#routes.push(route);
    }

    /**
     *
     * @param {string} path
     * @param {Handler|HandlerCallback} handler
     * @returns
     */
    get(path, handler) {
        this.#addRoute('GET', path, handler);

        return this;
    }

    /**
     *
     * @param {string} path
     * @param {Handler|HandlerCallback} handler
     * @returns
     */
    post(path, handler) {
        this.#addRoute('POST', path, handler);

        return this;
    }

    /**
     *
     * @param {string} path
     * @param {Handler|HandlerCallback} handler
     * @returns
     */
    put(path, handler) {
        this.#addRoute('PUT', path, handler);

        return this;
    }

    /**
     *
     * @param {string} path
     * @param {Handler|HandlerCallback} handler
     * @returns
     */
    patch(path, handler) {
        this.#addRoute('PATCH', path, handler);

        return this;
    }

    /**
     *
     * @param {string} path
     * @param {Handler|HandlerCallback} handler
     * @returns
     */
    delete(path, handler) {
        this.#addRoute('DELETE', path, handler);

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
