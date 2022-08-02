import { ServerResponse } from "http";

export default class Response {
    /** @type {ServerResponse} */
    #res;

    constructor(res) {
        this.#res = res;
    }

    withHeader(key, value) {
        this.#res.setHeader(key, value);

        return this;
    }

    send(data) {
        this.#res.write(data);

        return this;
    }

    json(data) {
        return this.withHeader('Content-Type', 'application/json')
            .send(JSON.stringify(data));
    }

    withStatus(code) {
        this.#res.statusCode = code;

        return this;
    }

    get sent() {
        return this.#res.headersSent;
    }
}
