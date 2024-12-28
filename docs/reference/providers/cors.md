# Cross-Origin Resource Sharing Config Provider Reference
The `CORSConfigProvider` is a configuration provider that registers the `CORS` configuration.

## Usage
```ts
import { CORSConfigProviderFactory } from 'midori/providers';

server.configure(CORSConfigProviderFactory({
    origin: 'https://example.com',
    methods: ['GET', 'POST'],
    headers: ['Content-Type'],
    credentials: true,
    maxAge: 3600,
    openerPolicy: 'same-origin',
    embedderPolicy: 'require-corp'
}));
```
