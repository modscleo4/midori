## Request Config Provider Reference
The `RequestConfigProvider` is a configuration provider that registers the `Request` configuration.

### Usage
```ts
import { RequestConfigProviderFactory } from 'midori/providers';

server.configure(RequestConfigProviderFactory({
    // Max body size in bytes.
    maxBodySize: 1024 * 1024,
}));
```
