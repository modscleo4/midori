# Error Config Provider Reference
The `ErrorConfigProvider` is a configuration provider that registers the `Error` configuration.

## Usage
```ts
import { ErrorConfigProviderFactory } from 'midori/providers';

server.configure(ErrorConfigProviderFactory({
    // If true, the error stack will be exposed in the response.
    exposeErrors: true,
}));
```
