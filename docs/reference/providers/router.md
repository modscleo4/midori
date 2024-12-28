# Router Service Provider Reference
The `RouterServiceProviderFactory` is a service provider that registers the `Router` instance with the application container. This allows the `Router` to be injected into other parts of the application, such as middleware or handlers.

## Usage
```ts
import { RouterServiceProviderFactory } from 'midori/providers';
import { Router } from 'midori/router';

const router = new Router();
// Define routes here

server.install(RouterServiceProviderFactory(router));
```
