# ImplicitOptionsMiddleware Reference
The `ImplicitOptionsMiddleware` middleware automatically handles `OPTIONS` requests by responding with the allowed methods for the requested resource. This middleware is useful when you want to support `OPTIONS` requests without implementing separate logic for them.

## Usage
To use the `ImplicitOptionsMiddleware`, pipe it to the server instance:
```ts
import { ImplicitOptionsMiddleware } from 'midori/middlewares';

server.pipe(ImplicitOptionsMiddleware);
```

## Middleware Lifecycle
1. **Request Processing:** The middleware intercepts `OPTIONS` requests.
2. **Response Handling:** The middleware responds with the allowed methods for the requested resource.
