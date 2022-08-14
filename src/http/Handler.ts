import Server from "../app/Server.js";
import Request from "./Request.js";
import Response from "./Response.js";

export default abstract class Handler {
    abstract handle(req: Request, server: Server): Promise<Response>;
}
