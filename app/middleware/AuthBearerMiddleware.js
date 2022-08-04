import Middleware from "../../lib/Middleware.js";
import Request from "../../lib/Request.js";
import Response from "../../lib/Response.js";
import { validateJWT } from "../../lib/jwt.js";

export default class AuthBearerMiddleware extends Middleware {
    /**
     *
     * @param {Request} req
     * @param {Function} next
     * @return {Promise<Response>}
     */
    async process(req, next) {
        if (!req.headers['authorization']) {
            return Response.json({ message: 'Invalid Authorization header.' }).withStatus(401);
        }

        const header = req.headers['authorization'].split(' ', 2);
        const scheme = header[0];
        const credentials = header[1];

        if (scheme !== 'Bearer') {
            return Response.json({ message: 'Invalid Authorization scheme.' }).withStatus(401);
        }

        if (!credentials || !validateJWT(credentials)) {
            return Response.json({ message: 'Invalid Authorization credentials.' }).withStatus(401);
        }

        const [, payloadBase64] = credentials.split('.');

        /** @type {import('../../lib/jwt.js').Payload} */
        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());

        if (!(typeof payload === 'object' && payload.hasOwnProperty('exp') && payload.hasOwnProperty('iat'))) {
            return Response.json({ message: 'Invalid Authorization credentials.' }).withStatus(401);
        }

        if (payload.iat + payload.exp * 1000 < Date.now()) {
            return Response.json({ message: 'Token has expired.' }).withStatus(401);
        }

        req.jwt = payload;

        return await next(req);
    }
}
