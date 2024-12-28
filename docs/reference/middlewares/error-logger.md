# ErrorLoggerMiddleware Reference
The `ErrorLoggerMiddleware` logs errors using the [LoggerService](../providers/logger-service.md). It is useful for debugging and monitoring the application.

## Usage
```ts
import { ErrorLoggerMiddleware } from 'midori/middlewares';

server.pipe(ErrorLoggerMiddleware);
```

When an error occurs in the handler, the middleware logs the error message and stack trace to the console and re-throws the error.

If you want to use with [ErrorMiddleware](./error.md), make sure to pipe `ErrorLoggerMiddleware` last.
```ts
server.pipe(ErrorMiddleware);
server.pipe(ErrorLoggerMiddleware);
```

## Middleware Lifecycle
1. **Request Processing:** The middleware intercepts errors thrown by the handler.
2. **Logging:** The middleware logs the error message and stack trace to the console.
3. **Error Handling:** The middleware re-throws the error to the next middleware.
