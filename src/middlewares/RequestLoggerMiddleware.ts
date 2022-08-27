import { performance } from "perf_hooks";

import Server from "../app/Server.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import Logger, { LogColor } from "../log/Logger.js";

/**
 * Log any request to the Logger Service Provider.
 */
export default class RequestLoggerMiddleware extends Middleware {
    #logger: Logger;

    constructor(server: Server) {
        super(server);

        this.#logger = server.providers.get('Logger');
    }

    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const startTime = performance.now();

        const res = await next(req);

        this.logRequest(req, res, performance.now() - startTime);

        return res;
    }

    /** @internal */
    logRequest(req: Request, res: Response, time: number) {
        this.#logger.info(`${req.method} ${req.path} ${res.status} (${time.toFixed(2)}ms)`, { fgColor: res.status < 400 ? LogColor.GREEN : res.status < 500 ? LogColor.YELLOW : LogColor.RED });
    }
}
