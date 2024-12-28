# User Service Provider Reference
The `UserServiceProviderFactory` is a service provider that registers the `User` instance with the application container. This allows the `User` to be injected into other parts of the application, such as middleware or handlers.

## Usage
```ts
import { UserServiceProviderFactory } from 'midori/providers';

server.install(UserServiceProviderFactory(...));
```

## Service
The `UserService` provides the following methods:

- `async getUserById(id: unknown): Promise<User | null>;`: Retrieves a user by their ID.
- `async getUserByCredentials(username: string, password: string): Promise<User | null>;`: Retrieves a user by their username and password.
