import { performance } from "perf_hooks";

import { Application } from "../app/Server.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import Logger, { LogColor } from "../log/Logger.js";
import { LoggerServiceProvider } from "../providers/LoggerServiceProvider.js";

/**
 * Log any request to the Logger Service.
 */
export default class RequestLoggerMiddleware extends Middleware {
    #logger: Logger;

    constructor(app: Application) {
        super(app);

        this.#logger = app.services.get(LoggerServiceProvider);
    }

    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const startTime = performance.now();

        const res = await next(req);

        this.logRequest(req, res, performance.now() - startTime);

        return res;
    }

    logRequest(req: Request, res: Response, time: number) {
        const ip = req.headers['x-real-ip'] ?? (Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for']) ?? req.socket.remoteAddress ?? 'unknown ip';
        this.#logger.info(`<${ip}> ${req.method} ${req.path} ${res.status} (${time.toFixed(2)}ms)`, { fgColor: res.status < 400 ? LogColor.GREEN : res.status < 500 ? LogColor.YELLOW : LogColor.RED });
    }
}
