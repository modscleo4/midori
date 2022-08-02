import {IncomingMessage} from "http";

export default class Request {
    /** @type {import('http').IncomingHttpHeaders} */
    #headers;
    #query;
    #method;
    #path;

    /** @type {string} */
    #body = '';

    /** @type {*} */
    #parsedBody = undefined;

    /**
     *
     * @param {IncomingMessage} req
     */
    constructor(req) {
        const url = new URL(req.url ?? '', `http://${req.headers.host}`);

        this.#headers = req.headers;
        this.#query = [...url.searchParams.keys()].reduce((acc, key) => { acc[key] = url.searchParams.get(key); return acc; }, {});
        this.#method = req.method;
        this.#path = url.pathname + (url.pathname.endsWith('/') ? '' : '/');

        let chunk;
        while ((chunk = req.read()) !== null) {
            this.#body += chunk;
        }
    }

    get headers() {
        return this.#headers;
    }

    get query() {
        return this.#query;
    }

    get method() {
        return this.#method;
    }

    get path() {
        return this.#path;
    }

    get body() {
        return this.#body;
    }

    get parsedBody() {
        if (this.#parsedBody !== undefined) {
            return this.#parsedBody;
        }

        if (this.#headers['content-type']?.startsWith('application/json')) {
            this.#parsedBody = JSON.parse(this.#body);
        } else if (this.#headers['content-type']?.startsWith('application/x-www-form-urlencoded')) {
            this.#parsedBody = new URLSearchParams(this.#body);
        } else if (this.#headers['content-type']?.startsWith('text/xml')) {
            const parser = new DOMParser();
            this.#parsedBody = parser.parseFromString(this.#body, 'text/xml');
        } else {
            this.#parsedBody = this.#body;
        }

        return this.#parsedBody;
    }
}
