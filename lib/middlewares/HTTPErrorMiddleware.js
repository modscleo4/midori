import Middleware from "../Middleware.js";
import Request from "../Request.js";
import Response from "../Response.js";
import HTTPError from "../errors/HTTPError.js";

export default class HTTPErrorMiddleware extends Middleware {
    /**
     *
     * @param {Request} req
     * @param {Function} next
     * @return {Promise<Response>}
     */
    async process(req, next) {
        try {
            return await next(req);
        } catch (e) {
            if (e instanceof HTTPError) {
                return Response.json({ message: e.message }).withStatus(e.status);
            }

            throw e;
        }
    }
}
