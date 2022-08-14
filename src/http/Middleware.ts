import Server from "../app/Server.js";
import Request from "./Request.js";
import Response from "./Response.js";

export default abstract class Middleware {
    abstract process(
        req: Request,
        next: (req: Request) => Promise<Response>,
        server: Server
    ): Promise<Response>;
}
