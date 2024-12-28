## Parse Body Config Provider Reference
The `ParseBodyConfigProvider` is a configuration provider that registers the `ParseBody` configuration.

### Usage
```ts
import { ParseBodyConfigProviderFactory } from 'midori/providers';

server.configure(ParseBodyConfigProviderFactory({
    // If true, any unknown content types will result in a 415 Unsupported Media Type response.
    errorOnUnknownContentType: true,
}));
```
