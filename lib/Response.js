import {ServerResponse} from "http";

export default class Response {
    #res;

    /**
     *
     * @param {ServerResponse} res
     */
    constructor(res) {
        this.#res = res;
    }

    send(data, code = 200) {
        this.#res.write(data);

        this.status(code);

        return this;
    }

    json(data, code = 200) {
        this.#res
            .setHeader('Content-Type', 'application/json')
            .write(JSON.stringify(data));

        this.status(code);

        return this;
    }

    status(code) {
        this.#res.statusCode = code;

        return this;
    }
}
