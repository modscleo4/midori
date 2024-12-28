# ContentLengthMiddleware Reference
The `ContentLengthMiddleware` calculates the `Content-Length` header for responses that don't have it set.

## Usage
This middleware is automatically included in the default middleware stack.

## Middleware Lifecycle
1. **Request Processing:** The middleware calculates the `Content-Length` header for responses that don't have it set.
2. **Next Function:** The middleware passes control to the next middleware using the `next` function.
