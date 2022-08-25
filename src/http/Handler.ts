import Server from "../app/Server.js";
import Request from "./Request.js";
import Response from "./Response.js";

export default abstract class Handler {
    constructor(server: Server) {
        //
    }

    /**
     * Handle a request.
     */
    abstract handle(req: Request): Promise<Response>;
}
