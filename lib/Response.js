import { Readable } from "stream";

let allowBody = true;

export default class Response {
    /** @type {Map<string, string>} */
    #headers = new Map();

    /** @type {number} */
    #status = 200;

    /** @type {Buffer[]} */
    #body = [];

    constructor() {

    }

    /**
     *
     * @param {string} key
     * @param {string} value
     * @return {Response}
     */
    withHeader(key, value) {
        this.#headers.set(key, value);

        return this;
    }

    /**
     *
     * @param {Buffer} data
     * @return {Response}
     */
    send(data) {
        if (allowBody) {
            this.#body.push(data);
        }

        return this;
    }

    /**
     *
     * @param {*} data
     * @return {Response}
     */
    json(data) {
        this.withHeader('Content-Type', 'application/json')
            .send(Buffer.from(JSON.stringify(data)));

        return this;
    }

    /**
     *
     * @param {number} code
     * @return {Response}
     */
    withStatus(code) {
        this.#status = code;

        return this;
    }

    get headers() {
        return this.#headers;
    }

    get status() {
        return this.#status;
    }

    get body() {
        const buffer = Buffer.concat(this.#body);

        let offset = 0;
        return new Readable({
            read(size) {
                const chunk = buffer.slice(offset, offset + size);
                offset += chunk.length;

                if (chunk.length === 0) {
                    this.push(null);
                } else {
                    this.push(chunk);
                }
            }
        });
    }

    get bodyLength() {
        return this.#body.reduce((acc, chunk) => acc + chunk.length, 0);
    }

    /**
     *
     * @param {Buffer} data
     * @return {Response}
     */
    static send(data) {
        return new Response()
            .send(data);
    }

    /**
     *
     * @param {*} data
     * @return {Response}
     */
    static json(data) {
        return new Response().json(data);
    }

    /**
     *
     * @param {number} code
     * @return {Response}
     */
    static status(code) {
        return new Response()
            .withStatus(code);
    }

    /**
     *
     * @return {Response}
     */
    static empty() {
        return new Response()
            .withStatus(204);
    }

    /**
     *
     * @package
     * @param {boolean} allow
     */
    static allowBody(allow) {
        allowBody = allow;
    }
}
