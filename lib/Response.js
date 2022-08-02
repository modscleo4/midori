import {Readable} from "stream";

export default class Response {
    /** @type {Map<string, string>} */
    #headers = new Map();

    /** @type {number} */
    #status = 200;

    /** @type {Buffer[]} */
    #body = [];

    constructor() {

    }

    withHeader(key, value) {
        this.#headers.set(key, value);

        return this;
    }

    /**
     *
     * @param {Buffer} data
     * @returns
     */
    send(data) {
        this.#body.push(data);

        return this;
    }

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

    static json(data) {
        return new Response()
            .withHeader('Content-Type', 'application/json')
            .send(Buffer.from(JSON.stringify(data)));
    }

    static status(code) {
        return new Response()
            .withStatus(code);
    }
}
