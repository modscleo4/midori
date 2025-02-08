import { performance } from "node:perf_hooks";

import type { Application } from "../app/Server.js";
import Middleware from "../http/Middleware.js";
import type Request from "../http/Request.js";
import type Response from "../http/Response.js";
import type Logger from "../log/Logger.js";
import { LoggerServiceProvider } from "../providers/LoggerServiceProvider.js";
import { Color } from "../util/ansi.js";

/**
 * Log any request to the Logger Service.
 */
export default class RequestLoggerMiddleware extends Middleware {
    #logger: Logger;

    constructor(app: Application) {
        super(app);

        this.#logger = app.services.get(LoggerServiceProvider);
    }

    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const startTime = performance.now();

        const res = await next(req);

        this.logRequest(req, res, performance.now() - startTime);

        return res;
    }

    logRequest(req: Request, res: Response, time: number): void {
        const messageFormatting = { color: { fg: res.status < 400 ? Color.GREEN : res.status < 500 ? Color.YELLOW : Color.RED } };
        this.#logger.info(`<${req.ip ?? 'unknown IP'}> ${req.method} ${req.path} ${res.status} (${time.toFixed(2)}ms)`, undefined, messageFormatting);
    }
}
