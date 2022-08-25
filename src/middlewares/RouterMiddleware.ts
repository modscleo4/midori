import Server from "../app/Server.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import Router from "../router/Router.js";

export default class RouterMiddleware extends Middleware {
    #router: Router;

    constructor(server: Server) {
        super(server);

        this.#router = server.providers.get('Router');
    }

    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const routes = this.#router.filter(req.path);

        const route = routes.find(r => r.method === req.method);

        req.container.set('::routes', routes);
        req.container.set('::route', route);

        return await next(req);
    }
}
