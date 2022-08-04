import { IncomingMessage } from "http";

export default class Request {
    /** @type {import('http').IncomingHttpHeaders} */
    #headers;

    /** @type {URLSearchParams} */
    #query;

    /** @type {Map<string, string>} */
    #params = new Map();

    /** @type {string} */
    #method;

    /** @type {string} */
    #path;

    /** @type {string} */
    #body = '';

    /** @type {*} */
    #parsedBody = undefined;

    /** @type {import('./jwt.js').Payload} */
    #jwt;

    /**
     *
     * @param {IncomingMessage} req
     */
    constructor(req) {
        const url = new URL(req.url ?? '', `http://${req.headers.host}`);

        this.#headers = req.headers;
        this.#query = url.searchParams;
        this.#method = req.method ?? '';
        this.#path = url.pathname + (url.pathname.endsWith('/') ? '' : '/');

        req.on('readable', () => {
            let chunk;
            while ((chunk = req.read(1024)) !== null) {
                this.#body += chunk.toString();
            }
        });
    }

    get headers() {
        return this.#headers;
    }

    get query() {
        return this.#query;
    }

    get params() {
        return this.#params;
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
            const parsed = new URLSearchParams(this.#body);

            const obj = {};
            for (const [key, value] of parsed) {
                obj[key] = value;
            }

            this.#parsedBody = obj;
        } else if (this.#headers['content-type']?.startsWith('text/xml')) {
            const parser = new DOMParser();
            this.#parsedBody = parser.parseFromString(this.#body, 'text/xml');
        } else {
            this.#parsedBody = this.#body;
        }

        return this.#parsedBody;
    }

    get jwt() {
        return this.#jwt;
    }

    set jwt(jwt) {
        this.#jwt = jwt;
    }
}
