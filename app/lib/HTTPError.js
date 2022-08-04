export default class HTTPError extends Error {
    /**
     * @param {string} message
     * @param {number} [status=500]
     */
    constructor(message, status = 500) {
        super(message);
        this.status = status;
    }
}
