# Quick Start
This guide will help you set up a basic Midori application in just a few steps.

## Step 1: Initialize Your Project
First, create a new Node.js project:

```bash
mkdir my-midori-app && cd my-midori-app
npm init -y
npm install modscleo4/midori
```

## Step 2: Create the Server
Create a `server.js` file with the following content:
```ts
import { Server, Response } from 'midori';

const server = new Server();

server.pipe(async (req, next) => {
    return Response.json({ message: 'Hello, World!' });
});

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
```

Run your server with:

```bash
node server.js
```

Visit `http://localhost:8080` in your browser, and you should see a JSON response!
