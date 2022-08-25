import Server from "../app/Server.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import Route from "../router/Route.js";

export default class DispatchMiddleware extends Middleware {
    constructor(private server: Server) {
        super(server);
    }

    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const route: Route = req.container.get('::route');

        if (!route) {
            return await next(req);
        }

        const params = route.getParams(req.path);
        for (const [param, value] of params) {
            req.params.set(param, value);
        }

        // Handle the request and get the response
        return await route.handle(req, this.server);
    }
}
