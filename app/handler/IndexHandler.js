import Handler from "../../lib/Handler.js";
import Request from "../../lib/Request.js";
import Response from "../../lib/Response.js";

export default class IndexHandler extends Handler {
    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async handle(req) {
        return Response.json({
            message: "Hello World!",
            headers: req.headers,
            query: [...req.query.keys()].reduce((acc, key) => {
                acc[key] = req.query.get(key);
                return acc;
            }, {})
        });
    }
}
