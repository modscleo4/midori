import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";

export default class ParseBodyMiddleware extends Middleware {
    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        try {
            req.parseBody();
        } catch (e) {
            return Response.status(415);
        }

        return await next(req);
    }
}
