import Request from "./Request.js";
import Response from "./Response.js";

export default class Middleware {
    /**
     *
     * @param {Request} req
     * @param {Function} next
     * @return {Promise<Response|void>}
     */
    async process(req, next) {
        await next();
    }
}
