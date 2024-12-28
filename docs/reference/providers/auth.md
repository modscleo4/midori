# Auth Service Provider Reference
The `AuthServiceProviderFactory` is a service provider that registers the `Auth` instance with the application container. This allows the `Auth` to be injected into other parts of the application, such as middleware or handlers.

## Usage
```ts
import { AuthServiceProvider, UserServiceProviderFactory } from 'midori/providers';

server.install(UserServiceProviderFactory(...));
server.install(AuthServiceProvider);
```

For more information on the User Service Provider, see the [UserServiceProvider](./user-service.md) documentation.


## Service
The `AuthService` provides the following methods:

- `async authenticateById(req: Request, id: unknown): Promise<User>;`: This method is used to authenticate a user by their ID, setting the `Auth.UserKey` request container key to the user object.
- `async authenticate(req: Request, username: string, password: string): Promise<User>;`: This method is used to authenticate a user by their username and password, setting the `Auth.UserKey` request container key to the user object.
- `async attempt(username: string, password: string): Promise<User | null>;`: This method is used to attempt to authenticate a user by their username and password, returning the user object if successful.
- `check(req: Request): boolean;`: This method is used to check if a user is authenticated.
- `user(req: Request): User | null;`: This method is used to get the authenticated user from the request container.
- `id(req: Request): unknown | null;`: This method is used to get the authenticated user's ID from the request container.
