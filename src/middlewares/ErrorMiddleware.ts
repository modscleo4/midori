import Server from "../app/Server.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import Logger, { LogColor } from "../log/Logger.js";

export default class ErrorMiddleware extends Middleware {
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

            // The status code for a server error is 500
            const response = Response.status(500);
            if (!!process.env.EXPOSE_ERRORS && e instanceof Error) {
                response.json({ message: e.message, stack: this.parseStack(e.stack ?? '') });
            }

            return response;
        }
    }

    parseStack(stack: string): {method: string, file: string, line: number, column: number}[] {
        return stack.split('\n').slice(1).map(l => l.trim()).map(l => {
            const {method, file, line, column} = /at ?(?<method>[^ ]*) \(?(?<file>.*):(?<line>\d+):(?<column>\d+)\)?/g.exec(l)?.groups ?? {};

            return {
                method,
                file,
                line: parseInt(line),
                column: parseInt(column),
            };
        });
    }
}
