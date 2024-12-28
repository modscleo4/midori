# RouterMiddleware Reference
`RouterMiddleware` is a built-in middleware that finds the appropriate handler for an incoming request based on the HTTP method and path. It does not handle the request itself but instead sets the `handler` property on the request object. It is typically used in conjunction with the [DispatchMiddleware](./dispatch.md) to route requests to the correct handler.

## Usage
```ts

import { DispatchMiddleware, RouterMiddleware } from 'midori/middlewares';

server.pipe(RouterMiddleware);
server.pipe(DispatchMiddleware);
```

For more information on dispatching requests, see the [DispatchMiddleware](./dispatch.md) documentation.

## Example
```ts
import { Server } from 'midori/app';
import { Request, Response } from 'midori/http';
import { DispatchMiddleware, RouterMiddleware, NotFoundMiddleware } from 'midori/middlewares';
import { RouterServiceProviderFactory } from 'midori/providers';
import { Router } from 'midori/router';

const server = new Server();

const router = new Router();
router.get('/hello', async (req: Request) => {
    return Response.text('Hello, world!');
});

server.install(RouterServiceProviderFactory(router));

server.pipe(RouterMiddleware);
server.pipe(DispatchMiddleware);
server.pipe(NotFoundMiddleware);

server.listen(3000);
```

In this example, the `RouterMiddleware` is used to set the `handler` property on the request object based on the route defined in the `Router`. The `DispatchMiddleware` then dispatches the request to the appropriate handler. If no matching handler is found, the `NotFoundMiddleware` is called to return a 404 response.

You can test this example by sending a `GET` request to `http://localhost:3000/hello`, which should return a `Hello, world!` response.
```sh
curl http://localhost:3000/hello
```

## Service Provider
The Router Middleware depends on the [RouterServiceProvider](../providers/router-service.md) to get the `Router` instance. Make sure to install the `RouterServiceProvider` before using the `RouterMiddleware`.
