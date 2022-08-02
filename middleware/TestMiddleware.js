import Middleware from "../lib/Middleware.js";
import Request from "../lib/Request.js";
import Response from "../lib/Response.js";

export default class TestMiddleware extends Middleware {
    /**
     *
     * @param {Request} req
     * @param {Response} res
     * @param {Function} next
     * @return {Promise<void>}
     */
    async process(req, res, next) {
        console.log('TestMiddleware');
        // res.json({message: 'TestMiddleware'});
        await next();
    }
}
