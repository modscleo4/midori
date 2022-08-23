/**
 * Basic HTTP Error with a status code and message.
 * The HTTPErrorMiddleware will catch this error and send the status code and message to the client.
 */
export default class HTTPError extends Error {
    name: string = 'HTTPError';
    status: number;

    constructor(message: string, status: number = 500) {
        super(message);
        this.status = status;
    }
}
