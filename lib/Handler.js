import { ServerResponse } from "http";
import Request from "./Request.js";
import Response from "./Response.js";

export default class Handler {
    /**
     *
     * @param {Request} req
     * @param {Response} res
     * @return {Promise<void>}
     */
    async handle(req, res) {
        res.status(501);
    }
}
