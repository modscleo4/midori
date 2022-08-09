import Request from "./Request.js";
import Response from "./Response.js";

export type NextFunction = (req: Request) => Promise<Response>;

export default abstract class Middleware {
    abstract process(req: Request, next: NextFunction): Promise<Response>;
}
