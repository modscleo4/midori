# NotFoundMiddleware Reference
`NotFoundMiddleware` is a built-in middleware that always returns a 404 Not Found response.

## Usage
To use `NotFoundMiddleware`, pipe it to the server:
```ts
import { NotFoundMiddleware } from 'midori/middlewares';

server.pipe(NotFoundMiddleware);
```

Now, every request that reaches the end of the middleware pipeline will receive a 404 response.

## Middleware Lifecycle
1. **Response Handling:** The middleware returns a 404 Not Found response.
