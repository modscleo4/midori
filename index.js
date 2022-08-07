import dotenv from 'dotenv';

dotenv.config({ path: './.env.dev', override: true });
dotenv.config({ override: true });

import router from './app/routes/index.js';
import Server from "./lib/Server.js";
import { prisma } from './app/lib/Prisma.js';

const server = new Server({
    router
});

const port = 3000;

server.listen(port).on('listening', async () => {
    console.log(`Server is running on port ${port}`);
    await prisma.$connect();
}).on('close', async () => {
    await prisma.$disconnect();
});
