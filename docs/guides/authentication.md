# Authentication Guide
Authentication in Midori is a flexible and powerful system designed to handle various authentication schemes. It uses the `Auth` module to verify and authorize users, ensuring secure access to your application.

## Overview
The authentication system in Midori supports multiple schemes:
- **Basic Authentication:** Encodes username and password in the `Authorization` header.
- **Bearer Authentication:** Uses tokens (e.g., JWT) for secure, stateless authentication.
Both schemes are implemented as middleware and can be combined or extended as needed.

## Setting Up Authentication
### Step 1: Create a User Service
The `UserService` is responsible for retrieving user information. Create a class extending `UserService` and implement the `findUserByCredentials` and `findUserByToken` methods.
```ts
import { UserService, User } from 'midori/auth';

class MyUserService extends UserService {
    async getUserById(id: string): Promise<User | null> {
        // Example: Validate id against a database
        if (id === '1') {
            return new User({ id: '1', username: 'admin', role: 'admin' });
        }

        return null;
    }

    async getUserByCredentials(username: string, password: string): Promise<User | null> {
        // Example: Validate user against a database
        if (username === 'admin' && password === 'password') {
            return new User({ id: '1', username, role: 'admin' });
        }

        return null;
    }
}
```

Register your custom `UserService`:
```ts
import { UserServiceProviderFactory } from 'midori/providers';

server.install(UserServiceProviderFactory(MyUserService));
```

For more information on the `UserService` methods, see the [User Service Provider Reference](../reference/providers/user.md).

### Step 2: Install the Authentication Middleware
To enable authentication in your application, you must install the `AuthServiceProvider` and configure the `Auth` module.
```ts
import { AuthServiceProvider } from 'midori/providers';

// Install the Auth Service Provider
server.install(AuthServiceProvider);
```

### Step 3: Use Authentication Middleware
Use the provided middleware to enable authentication for specific routes.

#### Basic Authentication
```ts
import { Auth } from 'midori/auth';
import { AuthBasicMiddleware, AuthMiddleware } from 'midori/middlewares';

router.get('/basic-protected', async (req) => {
    const user = req.container.get(Auth.UserKey);
    return Response.json({ message: `Welcome, ${user?.username}` });
}, [AuthBasicMiddleware, AuthMiddleware]);
```

#### Bearer Authentication
```ts
import { Auth } from 'midori/auth';
import { AuthBearerMiddleware } from 'midori/middlewares';

router.get('/bearer-protected', async (req) => {
    const user = req.container.get(Auth.UserKey);
    return Response.json({ message: `Hello, ${user?.username}` });
}, [AuthBearerMiddleware, AuthMiddleware]);
```

## Custom Authentication Middleware
For custom authentication logic, create a new middleware:
```ts
import { Middleware, Request, Response } from 'midori/http';

class MyCustomAuthMiddleware extends Middleware {
    async handle(req: Request, next: Function): Promise<Response> {
        const token = req.headers['authorization']?.split(' ')[1];
        if (token !== 'my-secret-token') {
            return Response.json({ error: 'Unauthorized' }).withStatus(401);
        }

        return await next(req);
    }
}
```

Apply your custom middleware to a route:
```ts
router.get('/custom-protected', async () => {
    return Response.json({ message: 'Access granted!' });
}, [MyCustomAuthMiddleware]);
```

## Best Practices
1. **Secure Sensitive Data:** Always encrypt sensitive data, such as passwords, before storing them in a database.
2. **Use HTTPS:** Ensure your application is served over HTTPS to prevent token or credential theft.
3. **Limit Access:** Apply authentication middleware to only the routes that require protection.
4. **Token Expiry:** Implement token expiration and refresh mechanisms for Bearer tokens.

Authentication in Midori is designed to be extensible, allowing you to create custom authentication mechanisms or adapt existing ones to meet your application’s security requirements.
