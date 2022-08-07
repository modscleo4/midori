import Middleware from "../Middleware.js";
import Request from "../Request.js";
import Response from "../Response.js";

export default class ParseBodyMiddleware extends Middleware {
    /**
     *
     * @param {Request} req
     * @param {Function} next
     * @return {Promise<Response>}
     */
    async process(req, next) {
        try {
            req.parseBody();
        } catch (e) {
            return Response.status(415);
        }

        return await next(req);
    }
}
