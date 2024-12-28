# Examples
This guide provides a variety of examples to help you get started with Midori. Each example demonstrates a specific use case or feature of the framework.

## Hello World
Start with the simplest example to return a "Hello World" message.
```ts
import { Server } from 'midori/app';
import { Response } from 'midori/http';

const server = new Server();

server.pipe(async () => {
    return Response.json({ message: 'Hello World!' });
});

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});

```

## Routing with Parameters
Demonstrate how to use dynamic parameters in routes.
```ts
import { Server } from 'midori/app';
import { Response } from 'midori/http';
import { Router } from 'midori/router';
import { RouterMiddleware, DispatchMiddleware, NotFoundMiddleware } from 'midori/middlewares';
import { RouterServiceProviderFactory } from 'midori/providers';

const router = new Router();

router.get('/user/{id:number}', async req => {
    const id = req.params.get('id');
    return Response.json({ message: `User ID is ${id}` });
});

const server = new Server();

server.install(RouterServiceProviderFactory(router));

server.pipe(RouterMiddleware);
server.pipe(DispatchMiddleware);
server.pipe(NotFoundMiddleware);

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
```

## Using Middlewares
Here’s how to add a middleware to log requests.
```ts
import { Server } from 'midori/app';
import { Request, Response } from 'midori/http';

const server = new Server();

server.pipe(async (req: Request, next: (req: Request) => Promise<Response>): Promise<Response> => {
    console.log(`Received ${req.method} request for ${req.url}`);
    return await next(req);
});

server.pipe(async () => {
    return Response.json({ message: 'Middleware example!' });
});

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
```

## Authentication Example
Enable Basic Authentication for a route.

```ts
import { Server } from 'midori/app';
import { UserService, User } from 'midori/auth';
import { Request, Response } from 'midori/http';
import { AuthMiddleware, AuthBasicMiddleware } from 'midori/middlewares';
import { AuthServiceProvider, UserServiceProviderFactory } from 'midori/providers';

class MyUser extends User {
    #role: string;

    constructor(id: any, username: string, role: string) {
        super(id, username);
        this.#role = role;
    }

    get role() {
        return this.#role;
    }
}

class MyUserService extends UserService {
    override async getUserByCredentials(username: string, password: string) {
        if (username === 'admin' && password === 'password'): Promise<User | null> { {
            return new MyUser('1', username, 'admin');
        }

        return null;
    }

    override async getUserById(id: any): Promise<User | null> {
        if (id === '1') {
            return new MyUser(id, 'admin', 'admin');
        }

        return null;
    }
}

const server = new Server();

server.install(UserServiceProviderFactory(new MyUserService()));
server.install(AuthServiceProvider);

server.pipe(AuthBasicMiddleware);
server.pipe(AuthMiddleware);

server.pipe(async (req: Request, next: (req: Request) => Promise<Response>, app: Application): Promise<Response> => {
    const authService = app.services.get(AuthServiceProvider);
    const user = authService.user(req);
    return Response.json({ message: `Welcome, ${user?.username}` });
});

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
```

## Static File Serving
Serve static files from a directory.
```ts
import { Server } from 'midori/app';
import { NotFoundMiddleware, PublicPathMiddleware } from 'midori/middlewares';
import { PublicPathConfigProviderFactory } from 'midori/providers';

const server = new Server();

server.configure(PublicPathConfigProviderFactory({
    path: './public',
    generateIndex: true, // Generate Apache-style directory index
}));

server.pipe(PublicPathMiddleware);
server.pipe(NotFoundMiddleware);

server.listen(8080, () => {
    console.log('Server is serving static files from ./public on http://localhost:8080');
});

```

## Task Scheduling
Schedule tasks using the Scheduler module.
```ts
import { Server } from 'midori/app';
import { Task } from 'midori/scheduler';

class MyTask extends Task {
    override async run(): void {
        console.log('Task executed!');
    }
}

const server = new Server();

server.schedule('* * * * *', MyTask);

server.listen(8080, () => {
    console.log('Server is running, and tasks are scheduled.');
});
```

These examples cover common use cases in Midori. Use them as starting points to explore the framework further!
