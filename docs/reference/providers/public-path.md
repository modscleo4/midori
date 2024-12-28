## JWT Config Provider Reference
The `JWTConfigProvider` is a configuration provider that registers the `JWT` configuration.

### Usage
```ts
import { PublicPathConfigProviderFactory } from 'midori/providers';

server.configure(PublicPathConfigProviderFactory({
    // Required: The path to the directory containing the static files.
    path: '/path/to/static/files',
}));
```
