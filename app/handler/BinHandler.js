import { Handler, Request, Response } from "apiframework";
import { HTTPError } from "apiframework/errors";
import { generateUUID } from "apiframework/util/uuid.js";

import Bin from "../model/Bin.js";

export default class BinHandler extends Handler {
    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async get(req) {
        const data = await Bin.all();

        return Response.json(data);
    }

    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async post(req) {
        if (!req.parsedBody) {
            throw new HTTPError("Invalid body.", 400);
        }

        const id = generateUUID();

        const data = {
            id,
            username: req.jwt.sub,
            content: req.parsedBody
        };

        const saved = await Bin.create(data);
        if (!saved) {
            throw new HTTPError("Failed to save bin.", 500);
        }

        return Response.json(data).withStatus(201);
    }

    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async handle(req) {
        switch (req.method) {
            case 'GET':
                return await this.get(req);

            case 'POST':
                return await this.post(req);
        }

        return Response.status(405);
    }
}
