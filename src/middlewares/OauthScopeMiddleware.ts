import HTTPError from "../errors/HTTPError.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import { Constructor } from "../util/types.js";

export default function OauthScopeMiddleware(scopes: string[]): Constructor<Middleware> {
    return class extends Middleware {
        async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
            if (req.container.get('jwt')) {
                const userScopes = req.container.get('jwt').scopes ?? [];
                for (const scope of scopes) {
                    if (!userScopes.includes(scope)) {
                        throw new HTTPError(`Insufficient permissions: ${scope}`, 403);
                    }
                }
            }

            return await next(req);
        }
    }
}
