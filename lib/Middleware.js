import Request from "./Request.js";
import Response from "./Response.js";

export default class Middleware {
    /**
     *
     * @param {Request} req
     * @param {Response} res
     * @param {Function} next
     * @return {Promise<void>}
     */
    async process(req, res, next) {
        await next();
    }
}
