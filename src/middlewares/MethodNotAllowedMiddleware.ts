import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import Route from "../router/Route.js";

export default class MethodNotAllowedMiddleware extends Middleware {
    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const routes: Route[] = req.container.get('::routes');
        const route: Route = req.container.get('::route');

        if (routes.length > 0 && !route) {
            return Response.status(405);
        }

        return await next(req);
    }
}
