# DispatchMiddleware Reference
`DispatchMiddleware` is a built-in middleware that dispatches requests to the appropriate handler based on the HTTP method and path. If no matching handler is found, it calls the next middleware in the pipeline (usually [NotFoundMiddleware](./not-found.md)).

## Usage
```ts
import { DispatchMiddleware, RouterMiddleware } from 'midori/middlewares';

server.pipe(RouterMiddleware);
server.pipe(DispatchMiddleware);
```

For more information on routing, see the [RouterMiddleware](./router.md) documentation.

## Middleware Lifecycle
1. **Request Processing:** The middleware dispatches the request to the appropriate handler based on the HTTP method and path.
2. **Next Function:** The middleware passes control to the next middleware using the `next` function (usually [NotFoundMiddleware](./not-found.md)).
