import Middleware from "../../lib/Middleware.js";
import Request from "../../lib/Request.js";
import Response from "../../lib/Response.js";

export default class TestMiddleware extends Middleware {
    /**
     *
     * @param {Request} req
     * @param {Function} next
     * @return {Promise<Response>}
     */
    async process(req, next) {
        if (req.headers['x-test-middleware'] === 'true') {
            return Response.json({message: 'TestMiddleware'});
        }

        const response = await next(req);

        console.log('TestMiddleware::status', response.status);

        return response;
    }
}
