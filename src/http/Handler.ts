import Request from "./Request.js";
import Response from "./Response.js";

export default abstract class Handler {
    abstract handle(req: Request): Promise<Response>;
}
