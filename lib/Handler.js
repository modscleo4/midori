import Request from "./Request.js";
import Response from "./Response.js";

export default class Handler {
    /**
     *
     * @abstract
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async handle(req) {
        return Response.status(501);
    }
}
