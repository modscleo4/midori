import { Handler, Request, Response } from "apiframework";
import { HTTPError } from "apiframework/errors";

import Bin from "../model/Bin.js";

export default class BinByIdHandler extends Handler {
    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async get(req) {
        const id = req.params.get('id');
        if (!id) {
            throw new HTTPError("Invalid ID.", 400);
        }

        const bin = await Bin.get(id);
        if (!bin) {
            throw new HTTPError('Bin not found.', 404);
        }

        return Response.json(bin);
    }

    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async put(req) {
        const id = req.params.get('id');
        if (!id) {
            throw new HTTPError("Invalid ID.", 400);
        }

        const bin = await Bin.get(id);

        if (!bin) {
            throw new HTTPError('Bin not found.', 404);
        }

        if (bin.username !== req.jwt.sub) {
            throw new HTTPError('You are not the owner of this bin.', 403);
        }

        if (!req.parsedBody) {
            throw new HTTPError("Invalid body.", 400);
        }

        bin.content = req.parsedBody;

        await Bin.save(bin);

        return Response.json(bin);
    }

    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async patch(req) {
        const id = req.params.get('id');
        if (!id) {
            throw new HTTPError("Invalid ID.", 400);
        }

        const bin = await Bin.get(id);

        if (!bin) {
            throw new HTTPError('Bin not found.', 404);
        }

        if (bin.username !== req.jwt.sub) {
            throw new HTTPError('You are not the owner of this bin.', 403);
        }

        if (!req.parsedBody) {
            throw new HTTPError("Invalid body.", 400);
        }

        bin.content = req.parsedBody;

        await Bin.save(bin);

        return Response.json(bin);
    }

    /**
     *
     * @param {Request} req
     * @return {Promise<Response>}
     */
    async delete(req) {
        const id = req.params.get('id');
        if (!id) {
            throw new HTTPError("Invalid ID.", 400);
        }

        const bin = await Bin.get(id);

        if (!bin) {
            throw new HTTPError('Bin not found.', 404);
        }

        if (bin.username !== req.jwt.sub) {
            throw new HTTPError('You are not the owner of this bin.', 403);
        }

        await Bin.delete(bin);

        return Response.empty();
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

            case 'PUT':
                return await this.put(req);

            case 'PATCH':
                return await this.patch(req);

            case 'DELETE':
                return await this.delete(req);
        }

        return Response.status(405);
    }
}
