import Handler from "../lib/Handler.js";
import Request from "../lib/Request.js";
import Response from "../lib/Response.js";

export default class IndexHandler extends Handler {
    /**
     *
     * @param {Request} req
     * @param {Response} res
     */
    async handle(req, res) {
        res.json({message: "Hello World!", query: req.query});
    }
}
