import routes from './app/routes/index.js';
import Server from "./lib/Server.js";

const server = new Server({
    routes
});

const port = 3000;

server.listen(port).on('listening', () => {
    console.log(`Server is running on port ${port}`);
});
