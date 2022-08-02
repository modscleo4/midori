import Handler from "../lib/Handler.js";

export default class IndexHandler extends Handler {
    async handle(req, res) {
        res.json({message: "Hello World!"});
    }
}
