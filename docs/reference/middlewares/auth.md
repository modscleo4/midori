# AuthMiddleware Reference
AuthMiddleware in Midori is a built-in middleware that automatically rejects requests without a valid authentication data. It is designed to be used with the `AuthBearerMiddleware` or `AuthBasicMiddleware` to enforce authentication requirements.

## Usage
To use `AuthMiddleware`, simply pipe it to your server instance:
```ts
import { AuthMiddleware } from 'midori/middlewares';

server.pipe(AuthMiddleware);
```

Now, all requests will be rejected with a `401 Unauthorized` response unless they include a valid authentication token.

## Middleware Lifecycle
1. **Request Processing:** The middleware checks for user authentication data in the request container (`Auth.UserKey`).
2. **Next Function:** If authentication data is found, the middleware passes control to the next middleware using the `next` function.
3. **Response Handling:** If no authentication data is found, the middleware returns a `401 Unauthorized` response.
