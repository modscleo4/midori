import Handler from "../../lib/Handler.js";
import Request from "../../lib/Request.js";
import Response from "../../lib/Response.js";

import bin from "../lib/bin.js";
import { generateUUID } from "../../lib/uuid.js";

export default class BinHandler extends Handler {
    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async get(req) {
        const data = [];
        for (const [key, value] of bin) {
            data.push({
                id: key,
                ...value
            });
        }

        return Response.json(data);
    }

    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async post(req) {
        if (!req.parsedBody) {
            return Response.status(400);
        }

        const id = generateUUID();

        bin.set(id, {
            user: req.jwt.sub,
            content: req.parsedBody
        });

        const data = {
            id: id,
            ...bin.get(id)
        };

        return Response.json(data).withStatus(201);
    }

    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async handle(req) {
        switch (req.method) {
            case 'HEAD':
            case 'GET':
                return await this.get(req);

            case 'POST':
                return await this.post(req);
        }

        return Response.status(405);
    }
}
