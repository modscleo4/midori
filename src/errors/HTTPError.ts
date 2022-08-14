export default class HTTPError extends Error {
    name: string = 'HTTPError';
    status: number;

    constructor(message: string, status: number = 500) {
        super(message);
        this.status = status;
    }
}
