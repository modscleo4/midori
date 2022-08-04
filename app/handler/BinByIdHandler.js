import Handler from "../../lib/Handler.js";
import Request from "../../lib/Request.js";
import Response from "../../lib/Response.js";
import bin from "../lib/bin.js";
import HTTPError from "../lib/HTTPError.js";

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

        if (!bin.has(id)) {
            throw new HTTPError('Bin not found.', 404);
        }

        const data = {
            id,
            ...bin.get(id)
        };

        return Response.json(data);
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

        if (!bin.has(id)) {
            throw new HTTPError('Bin not found.', 404);
        }

        if (bin.get(id)?.user !== req.jwt.sub) {
            throw new HTTPError('You are not the owner of this bin.', 403);
        }

        bin.set(id, {
            user: req.jwt.sub,
            content: req.parsedBody
        });

        const data = {
            id,
            ...bin.get(id)
        };

        return Response.json(data);
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

        if (!bin.has(id)) {
            throw new HTTPError('Bin not found.', 404);
        }

        if (bin.get(id)?.user !== req.jwt.sub) {
            throw new HTTPError('You are not the owner of this bin.', 403);
        }

        bin.set(id, {
            user: req.jwt.sub,
            content: req.parsedBody
        });

        const data = {
            id,
            ...bin.get(id)
        };

        return Response.json(data);
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

        if (!bin.has(id)) {
            throw new HTTPError('Bin not found.', 404);
        }

        if (bin.get(id)?.user !== req.jwt.sub) {
            throw new HTTPError('You are not the owner of this bin.', 403);
        }

        bin.delete(id);

        return Response.status(204);
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
