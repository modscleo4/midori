# Error Handling Guide
Error handling is a critical aspect of any application, ensuring that issues are properly managed and users receive meaningful feedback. Midori provides robust tools for handling errors through middleware and utility classes.

## Overview
Midori's error handling system includes:
1. **HTTPError:** A base class for HTTP-specific errors, allowing you to define and throw structured error responses.
2. **Error Middleware:** Middleware to catch and process errors during the request-response lifecycle.
3. **Error Logging:** Middleware to log errors for debugging and auditing purposes.

## Throwing HTTP Errors
Use the `HTTPError` class to throw standardized HTTP errors:
```ts
import { HTTPError } from 'midori/errors';

throw new HTTPError('Resource not found', 404);
```

The `HTTPError` class includes:
- **statusCode:** The HTTP status code (e.g., 404, 500).
- **message:** A brief description of the error.
- **extra (optional):** Additional error information.
- **extraHeaders (optional):** Additional headers to include in the response.

## Error Middleware
Midori provides built-in middleware for catching and responding to errors.
For more details, see the [Error Middleware](../reference/middlewares/error.md) section.

## Logging Errors
Use the `ErrorLoggerMiddleware` to log errors before they are sent to the client.
For more details, see the [Error Logger Middleware](../reference/middlewares/error-logger.md) section.

## Custom Error Middleware
You can create custom error middleware for specialized error handling.

### Example: Custom Error Formatter
```ts
import { Middleware, Request, Response } from 'midori';

class CustomErrorMiddleware extends Middleware {
    async handle(req: Request, next: Function): Promise<Response> {
        try {
            return await next(req);
        } catch (error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal Server Error';
            return Response.json({ error: message }, statusCode);
        }
    }
}
```

Install the custom middleware:
```ts
server.pipe(CustomErrorMiddleware);
```

## Best Practices
1. **Use HTTPError for Standardized Errors:** Always throw `HTTPError` for predictable error handling.
2. **Log All Errors:** Use `ErrorLoggerMiddleware` to log errors for monitoring and debugging.
3. **Respond with Meaningful Messages:** Avoid exposing sensitive information in error messages sent to clients.
4. **Catch Asynchronous Errors:** Ensure all promises are wrapped in `try-catch` to handle asynchronous errors.

## Example: Comprehensive Error Handling
```ts
import { Server } from 'midori/app';
import { Router } from 'midori/router';
import {
    ErrorLoggerMiddleware,
    ErrorMiddleware,
    RouterMiddlewareFactory,
    DispatcherMiddleware
} from 'midori/middlewares';

const server = new Server();
const router = new Router();

// Define a route that throws an error
router.get('/error', async () => {
    throw new HTTPError(400, 'Bad Request');
});

// Install middlewares
server.pipe(ErrorLoggerMiddleware);
server.pipe(ErrorMiddleware);
server.pipe(RouterMiddlewareFactory(router));
server.pipe(DispatcherMiddleware);

// Start the server
server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
```

Accessing `/error` will log the error and send a `400 Bad Request` response to the client.
