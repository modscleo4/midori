import Server from "../app/Server.js";
import Request from "./Request.js";
import Response from "./Response.js";

export default abstract class Handler {
    /**
     * Handle a request.
     */
    abstract handle(req: Request): Promise<Response>;
}
