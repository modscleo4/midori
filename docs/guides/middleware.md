# Middleware in Midori
Middlewares in Midori are functions or classes that sit in the middle of the request-response cycle.
They can modify the request or response objects, or perform additional tasks before or after the request is handled by the server.

## Creating a Middleware
Here's a simple example of a logging middleware:
```ts
import { Middleware, Request, Response } from 'midori';

class LoggingMiddleware extends Middleware {
    async handle(req: Request, next: Function): Promise<Response> {
        console.log(`Received request: ${req.method} ${req.url}`);
        return await next(req);
    }
}
```

To use this middleware in your application:
```ts
server.pipe(LoggingMiddleware);
```

## Built-in Middlewares
Midori includes several built-in middlewares for common tasks like error handling, authentication, and more. Check out the [reference section](../reference/modules/middlewares.md) for details.
