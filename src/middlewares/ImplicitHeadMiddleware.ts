import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import Route from "../router/Route.js";

export default class ImplicitHeadMiddleware extends Middleware {
    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        if (req.method === 'HEAD') {
            req.method = 'GET';

            const routes: Route[] = req.container.get('::routes');
            const route = routes.find(r => r.method === req.method);

            req.container.set('::route', route);

            const res = await next(req);
            return res.empty();
        }

        return await next(req);
    }
}
