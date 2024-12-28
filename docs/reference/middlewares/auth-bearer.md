# AuthBearerMiddleware Reference
AuthBearerMiddleware in Midori is a built-in middleware that performs HTTP Bearer authentication. It checks for a valid token in the `Authorization` header of the request.

## Usage
To use `AuthBearerMiddleware`, simply pipe it to your server instance:
```ts
import { AuthBearerMiddleware } from 'midori/middleware';

server.pipe(AuthBearerMiddleware);
```

You can then specify the expected token as an argument:

```sh
$ curl -H "Authorization: Bearer your-token" http://localhost:3000
```

If the authentication passes, the request will be forwarded to the next middleware or handler, setting the user properly. Otherwise, a `401 Unauthorized` response will be sent back to the client.

## Example
Here is an example of using `AuthBearerMiddleware` with a custom handler:
```ts
import { Request, Response } from 'midori/http';
import { AuthBearerMiddleware, AuthMiddleware } from 'midori/middlewares';
import { Auth } from 'midori/auth';

const handler = async (req: Request): Promise<Response> => {
    const user = req.container.get(Auth.UserKey); // If the authentication passes, the user will be set in the container
    const jwt = req.container.get(AuthBearerMiddleware.TokenKey); // The token payload will also be set in the container
    return Response.json({ user, jwt });
};

server.pipe(AuthBearerMiddleware, AuthMiddleware, handler);
```

## Middleware Lifecycle
1. **Request Processing:** The middleware checks for a valid token in the `Authorization` header.
2. **Next Function:** If the token is valid, the middleware sets the user and token in the container and passes control to the next middleware or handler.
3. **Response Handling:** If the token is invalid, the middleware sends a `401 Unauthorized` response back to the client.
