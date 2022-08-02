import Request from "./Request.js";
import Response from "./Response.js";

export default class Middleware {
    /**
     *
     * @param {Request} req
     * @param {Function} next
     * @return {Promise<Response>}
     */
    async process(req, next) {
        return await next(req);
    }
}
