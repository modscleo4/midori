# JWT Config Provider Reference
The `JWTConfigProvider` is a configuration provider that registers the `JWT` configuration.

## Usage
```ts
import { ErrorConfigProviderFactory } from 'midori/providers';

server.configure(ErrorConfigProviderFactory({
    exposeErrors: true,
}));
```
