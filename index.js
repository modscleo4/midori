import routes from './routes/index.js';
import {createServer} from 'http';
import Request from "./lib/Request.js";
import Response from "./lib/Response.js";

const server = createServer(async (req, res) => {
    const request = new Request(req);
    const response = new Response(res);

    if (!routes.some(r => r.path === request.path)) {
        response.status(404);
    } else {
        const route = routes.find(route => route.method === request.method && route.path === request.path);

        if (route) {
            try {
                await route.handle(request, response);
            } catch (e) {
                console.error(e);
                response.status(500);
            }
        } else {
            response.status(405);
        }
    }

    res.end();
});

const port = 3000;

server.listen(port).on('listening', () => {
    console.log(`Server is running on port ${port}`);
});
