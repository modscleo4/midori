import Middleware from "../../lib/Middleware.js";
import Request from "../../lib/Request.js";
import Response from "../../lib/Response.js";
import HTTPError from "../lib/HTTPError.js";

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
