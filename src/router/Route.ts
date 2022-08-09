import Handler from "../http/Handler.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";

export default class Route {
    #method: string;
    #path: string;
    #handler: Handler;
    #middlewares: Middleware[];
    #name: string;

    constructor(method: string, path: string, handler: Handler, middlewares: Middleware[]) {
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

    /** @internal */
    async handle(req: Request): Promise<Response> {
        const middlewares = this.#middlewares;
        let index = 0;

        const next = async (req: Request): Promise<Response> => {
            if (index == middlewares.length) {
                // No more middlewares to process
                return await this.#handler.handle(req);
            }

            return await middlewares[index++].process(req, next);
        };

        return await next(req);
    }

    /** @internal */
    getParams(path: string): Map<string, string> {
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

    withName(name: string): Route {
        this.#name = name;

        return this;
    }
}
