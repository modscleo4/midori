import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import HTTPError from "../errors/HTTPError.js";

export default class HTTPErrorMiddleware extends Middleware {
    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        try {
            return await next(req);
        } catch (e) {
            if (e instanceof HTTPError) {
                return Response.json({ message: e.message })
                    .withStatus(e.status);
            }

            throw e;
        }
    }
}
