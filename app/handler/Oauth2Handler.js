import { Handler, Request, Response } from "apiframework";
import { HTTPError } from "apiframework/errors";
import { generateJWT } from "apiframework/util/jwt.js";

export default class Oauth2Handler extends Handler {
    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async handlePasswordGrant(req) {
        if (!req.parsedBody.username || !req.parsedBody.password) {
            throw new HTTPError("Invalid request.", 400);
        }

        const scope = req.parsedBody.scope || "";

        const expires = 1000 * 60 * 60 * 1; // 1 hour

        const data = {
            sub: req.parsedBody.username,
            exp: Math.ceil((Date.now() + expires) / 1000),
            iat: Math.floor(Date.now() / 1000),
            scope,
        };

        const jwt = generateJWT(data);

        return Response.json({
            access_token: jwt,
            expires_in: expires / 1000,
            token_type: 'Bearer',
            scope,
        }).withStatus(201);
    }

    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async handleRefreshTokenGrant(req) {
        throw new HTTPError("Invalid request.", 400);
    }

    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async handle(req) {
        if (!req.parsedBody || !req.parsedBody.grant_type) {
            throw new HTTPError("Invalid request.", 400);
        }

        switch (req.parsedBody.grant_type) {
            case 'password':
                return await this.handlePasswordGrant(req);
            case 'refresh_token':
                return await this.handleRefreshTokenGrant(req);
        }

        throw new HTTPError("Invalid request.", 400);
    }
}
