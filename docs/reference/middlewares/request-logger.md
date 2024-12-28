# RequestLoggerMiddleware Reference
The `RequestLoggerMiddleware` logs incoming HTTP requests using the [LoggerService](../providers/logger-service.md). It is useful for debugging and monitoring the server's activity.

## Usage
```ts
import { RequestLoggerMiddleware } from 'midori/middlewares';

server.pipe(RequestLoggerMiddleware);
```

When a request is received by the server, the middleware logs the request method, URL, client IP address, and response status code.

## Middleware Lifecycle
2. **Next Function:** The middleware passes control to the next middleware using the `next` function.
3. **Response Handling:** The middleware logs the request details to the console.
