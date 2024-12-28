# MethodNotAllowedMiddleware Reference
The `MethodNotAllowedMiddleware` is a built-in middleware that returns a `405 Method Not Allowed` response when the request method is not allowed for the requested resource.

## Usage
To use the `MethodNotAllowedMiddleware`, pipe it to the server instance.
```ts
import { MethodNotAllowedMiddleware } from 'midori/middlewares';

server.pipe(MethodNotAllowedMiddleware);
```

## Middleware Lifecycle
1. **Request Processing:** The middleware checks if the request method is allowed for the requested resource.
2. **Next Function:** The middleware passes control to the next middleware using the `next` function.
3. **Response Handling:** The middleware returns a `405 Method Not Allowed` response if the request method is not allowed.
