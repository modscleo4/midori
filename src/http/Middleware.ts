import Server from "../app/Server.js";
import Request from "./Request.js";
import Response from "./Response.js";

export default abstract class Middleware {
    /**
     * Middlewares are used to process a request before it reaches the handler.
     * Here you can do things like authentication, authorization, etc.
     */
    abstract process(
        req: Request,

        /**
         * Process the next Middleware (or the Handler) in the chain.
         */
        next: (req: Request) => Promise<Response>
    ): Promise<Response>;
}
