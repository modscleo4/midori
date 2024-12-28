# Middleware Module Reference
Middleware in Midori plays a vital role in processing HTTP requests and responses. This module provides both built-in middleware options and the flexibility to create your own.

## Overview
A middleware function or class in Midori intercepts HTTP requests before they reach the main handler. It can perform various tasks, such as logging, authentication, validation, or modifying requests and responses.

## Built-in Middlewares
- [AuthMiddleware](./middlewares/auth.md)
- [AuthBasicMiddleware](./middlewares/auth-basic.md)
- [AuthBearerMiddleware](./middlewares/auth-bearer.md)
- [ContentLengthMiddleware](./middlewares/content-length.md)
- [ContentSecurityPolicyMiddleware](./middlewares/content-security-policy.md)
- [CORSMiddleware](./middlewares/cors.md)
- [DispatchMiddleware](./middlewares/dispatch.md)
- [ErrorLoggerMiddleware](./middlewares/error-logger.md)
- [ErrorMiddleware](./middlewares/error.md)
- [HTTPErrorMiddleware](./middlewares/http-error.md)
- [ImplicitHeadMiddleware](./middlewares/implicit-head.md)
- [ImplicitOptionsMiddleware](./middlewares/implicit-options.md)
- [MethodNotAllowedMiddleware](./middlewares/method-not-allowed.md)
- [NotFoundMiddleware](./middlewares/not-found.md)
- [ParseBodyMiddleware](./middlewares/parse-body.md)
- [PublicPathMiddleware](./middlewares/public-path.md)
- [RequestLoggerMiddleware](./middlewares/request-logger.md)
- [ResponseCompressionMiddleware](./middlewares/response-compression.md)
- [RouterMiddleware](./middlewares/router.md)
- [ValidationMiddleware](./middlewares/validation.md)

## Creating Custom Middleware
Custom middleware can be implemented as a class that extends the `Middleware` base class.

### Example: Authentication Middleware
This middleware checks for a valid API key in the request headers.
```ts
import { Middleware, Request, Response } from 'midori';

class MyAuthMiddleware extends Middleware {
    async handle(req: Request, next: Function): Promise<Response> {
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== 'your-secret-key') {
            return Response.json({ error: 'Unauthorized' }).withStatus(401);
        }

        return await next(req);
    }
}
```

To use it:
```ts
server.pipe(MyAuthMiddleware);
```

## Middleware Lifecycle
1. **Request Processing:** Each middleware is executed in the order it is piped.
2. **Next Function:** Middleware passes control to the next middleware using the `next` function.
3. **Response Handling:** Middleware can modify or replace the response before it is sent back to the client.

## Best Practices
- Keep middleware focused on a single responsibility.
- Use built-in middleware where possible for common tasks.
- Avoid blocking operations within middleware to ensure performance.

For more advanced use cases, explore other modules and how they interact with middleware!
