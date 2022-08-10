import { OutgoingHttpHeader } from "http";
import { Readable } from "stream";

let allowBody = true;

export default class Response {
    #headers = new Map<string, OutgoingHttpHeader>();
    #status: number = 200;
    #body: Buffer[] = [];

    constructor() {

    }

    withHeader(key: string, value: OutgoingHttpHeader): Response {
        this.#headers.set(key, value);

        return this;
    }

    send(data: Buffer): Response {
        if (allowBody) {
            this.#body.push(data);
        }

        return this;
    }

    json(data: any): Response {
        this.withHeader('Content-Type', 'application/json')
            .send(Buffer.from(JSON.stringify(data)));

        return this;
    }

    withStatus(code: number): Response {
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
                const chunk = buffer.subarray(offset, offset + size);
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

    static send(data: Buffer): Response {
        return new Response()
            .send(data);
    }

    static json(data: any): Response {
        return new Response()
            .json(data);
    }

    static status(code: number): Response {
        return new Response()
            .withStatus(code);
    }

    static empty(): Response {
        return new Response()
            .withStatus(204);
    }

    /** @internal */
    static allowBody(allow: boolean): void {
        allowBody = allow;
    }
}
