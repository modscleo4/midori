import Server from "../app/Server.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import Logger, { LogColor } from "../log/Logger.js";

/**
 * Log every unhandled error to the Logger Service Provider.
 */
export default class ErrorLoggerMiddleware extends Middleware {
    #logger: Logger;

    constructor(server: Server) {
        super(server);

        this.#logger = server.providers.get('Logger');
    }

    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        try {
            return await next(req);
        } catch (e) {
            this.#logger.error('An uncaught error occurred while handling a request.', { context: e, fgColor: LogColor.RED });

            throw e;
        }
    }
}
