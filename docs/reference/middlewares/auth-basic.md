# AuthBasicMiddleware Reference
AuthBasicMiddleware in Midori is a built-in middleware that performs HTTP Basic authentication. It checks for a valid username and password in the `Authorization` header of the request.

## Usage
To use `AuthBasicMiddleware`, simply pipe it to your server instance:
```ts
import { AuthBasicMiddleware } from 'midori/middleware';

server.pipe(AuthBasicMiddleware);
```

You can then specify the expected username and password as arguments:

```sh
$ curl -u username:password http://localhost:3000
```

If the authentication passes, the request will be forwarded to the next middleware or handler, setting the user properly. Otherwise, a `401 Unauthorized` response will be sent back to the client.

## Example
Here is an example of using `AuthBasicMiddleware` with a custom handler:
```ts
import { Request, Response } from 'midori/http';
import { AuthBasicMiddleware, AuthMiddleware } from 'midori/middlewares';
import { Auth } from 'midori/auth';

const handler = async (req: Request): Promise<Response> => {
    const user = req.container.get(Auth.UserKey); // If the authentication passes, the user will be set in the container
    return Response.json({ user });
};

server.pipe(AuthBasicMiddleware, AuthMiddleware, handler);
```

## Middleware Lifecycle
1. **Request Processing:** The middleware checks for the `Authorization` header in the request.
2. **Authentication:** The middleware validates the username and password using the `AuthService`.
3. **Next Function:** If the authentication passes, the middleware sets the user in the container and passes control to the next middleware using the `next` function.
4. **Response Handling:** If the authentication fails, the middleware sends a `401 Unauthorized` response back to the client.
