# ImplicitHeadMiddleware Reference
The `ImplicitHeadMiddleware` middleware automatically handles `HEAD` requests by converting them to `GET` requests. This middleware is useful when you want to support `HEAD` requests without implementing separate logic for them.

## Usage
To use the `ImplicitHeadMiddleware`, pipe it to the server instance:
```ts
import { ImplicitHeadMiddleware } from 'midori/middlewares';

server.pipe(ImplicitHeadMiddleware);
```

## Middleware Lifecycle
1. **Request Processing:** The middleware intercepts incoming `HEAD` requests.
2. **Next Function:** The middleware converts `HEAD` requests to `GET` requests and passes control to the next middleware.
3. **Response Handling:** The middleware removes the response body before sending it back to the client.
