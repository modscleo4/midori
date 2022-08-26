import { performance } from 'perf_hooks';

import Server from "../app/Server.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import Logger, { LogColor } from "../log/Logger.js";

export default class RequestLoggerMiddleware extends Middleware {
    #logger: Logger;

    constructor(server: Server) {
        super(server);

        this.#logger = server.providers.get('Logger');
    }

    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const startTime = performance.now();

        try {
            const res = await next(req);

            this.logRequest(req.method, req.path, res.status, performance.now() - startTime);

            return res;
        } catch (e) {
            this.#logger.error('An uncaught error occurred while handling a request.', { context: e, fgColor: LogColor.RED });

            this.logRequest(req.method, req.path, 500, performance.now() - startTime);

            throw e;
        }
    }

    /** @internal */
    logRequest(method: string, path: string, status: number, time: number) {
        this.#logger.info(`${method} ${path} ${status} (${time.toFixed(2)}ms)`, { fgColor: status < 400 ? LogColor.GREEN : status < 500 ? LogColor.YELLOW : LogColor.RED });
    }
}
