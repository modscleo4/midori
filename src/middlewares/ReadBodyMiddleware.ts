import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";

export default class ReadBodyMiddleware extends Middleware {
    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        try {
            await req.readBody();
        } catch (e) {
            return Response.status(413);
        }

        return await next(req);
    }
}
