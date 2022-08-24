import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import Route from "../router/Route.js";

export default class ImplicitOptionsMiddleware extends Middleware {
    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        if (req.method === 'OPTIONS') {
            const routes: Route[] = req.container.get('::routes');

            return Response.status(200)
                .withHeader('Allow', routes.map(r => r.method).join(','));
        }

        return await next(req);
    }
}
