import Middleware from "../../lib/Middleware.js";
import Request from "../../lib/Request.js";
import Response from "../../lib/Response.js";

export default class TestMiddleware extends Middleware {
    /**
     *
     * @param {Request} req
     * @param {Function} next
     * @return {Promise<Response|void>}
     */
    async process(req, next) {
        console.log('TestMiddleware');
        // return Response.json({message: 'TestMiddleware'});
        await next();
    }
}
