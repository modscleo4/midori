import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import { Constructor } from "../util/types.js";

export default function CORSMiddleware(headers?: { origin?: string; methods?: string; headers?: string; maxAge?: number }): Constructor<Middleware> {
    return class extends Middleware {
        async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
            const res = await next(req);

            return res.withHeader('Access-Control-Allow-Origin', headers?.origin ?? '*')
                .withHeader('Access-Control-Allow-Methods', headers?.methods ?? '*')
                .withHeader('Access-Control-Allow-Headers', headers?.headers ?? '*')
                .withHeader('Access-Control-Max-Age', headers?.maxAge ?? 86400);
        }
    };
}
