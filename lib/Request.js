import { IncomingMessage } from "http";

let hideHeadMethod = false;

export default class Request {
    /** @type {IncomingMessage} */
    #req;

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

    /** @type {import('./util/jwt.js').Payload} */
    #jwt;

    static maxBodySize = 1024 * 1024;

    /**
     *
     * @param {IncomingMessage} req
     */
    constructor(req) {
        this.#req = req;

        const url = new URL(req.url ?? '', `http://${req.headers.host}`);

        this.#headers = req.headers;
        this.#query = url.searchParams;
        this.#method = req.method ?? '';
        this.#path = url.pathname + (url.pathname.endsWith('/') ? '' : '/');
    }

    /**
     * @package
     * @return {Promise<void>}
     */
    async readBody() {
        // Wait for the body to be fully read before processing the request
        await new Promise((resolve, reject) => {
            let len = 0;
            this.#req.on('readable', () => {
                /** @type {Buffer} */
                let chunk;
                while ((chunk = this.#req.read(1024)) !== null) {
                    len += chunk.length;
                    if (len > Request.maxBodySize) {
                        reject(new Error('Max body size exceeded.'));
                    }

                    this.#body += chunk.toString();
                }
            });

            this.#req.on('end', resolve);
            this.#req.on('error', reject);
        });
    }

    /**
     *
     * @package
     * @return {void}
     */
    parseBody() {
        if (!this.#body) {
            return;
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

            if (this.#parsedBody.documentElement.nodeName === 'parsererror') {
                throw new Error('Invalid XML');
            }
        } else if (this.#headers['content-type']?.startsWith('text/plain')) {
            this.#parsedBody = this.#body;
        } else {
            throw new Error('Unsupported content type');
        }
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
        if (this.#method === 'HEAD' && hideHeadMethod) {
            return 'GET';
        }

        return this.#method;
    }

    get path() {
        return this.#path;
    }

    get body() {
        return this.#body;
    }

    get parsedBody() {
        if (this.#parsedBody === undefined) {
            return this.#body;
        }

        return this.#parsedBody;
    }

    get jwt() {
        return this.#jwt;
    }

    set jwt(jwt) {
        this.#jwt = jwt;
    }

    /**
     *
     * @package
     * @param {boolean} hide
     */
    static hideHeadMethod(hide) {
        hideHeadMethod = hide;
    }
}
