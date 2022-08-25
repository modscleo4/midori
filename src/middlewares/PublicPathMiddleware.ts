import { existsSync, statSync } from "fs";
import { readFile } from "fs/promises";
import { lookup } from "mime-types";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";

export default function PublicPathMiddleware(path: string) {
    return class extends Middleware {
        async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
            // Try to find a matching file in the public directory
            const file = path + (req.path.endsWith('/') ? req.path.substring(0, req.path.length - 1) : req.path);

            if (req.method === 'GET' && existsSync(file) && statSync(file).isFile()) {
                return Response.send(await readFile(file))
                    .withHeader('Content-Type', lookup(file) || 'text/plain')
                    .withStatus(200);
            }

            return await next(req);
        }
    };
}
