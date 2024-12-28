# PublicPathMiddleware Reference
PublicPathMiddleware in Midori is a built-in middleware that serves static files from a specified directory.

## Usage
To use the PublicPathMiddleware, pipe it to the server with the path to the directory containing the static files.
```ts
import { PublicPathMiddlewareFactory } from 'midori/middlewares';

server.pipe(PublicPathMiddlewareFactory({ path: '/path/to/static/files' }));
```

You can also use the `PublicPathConfigProvider` to configure the middleware in the application container.
```ts
import { PublicPathMiddleware } from 'midori/middlewares';
import { PublicPathConfigProviderFactory } from 'midori/providers';

server.configure(PublicPathConfigProviderFactory({ path: '/path/to/static/files' }));
server.pipe(PublicPathMiddleware);
```

Usually, the PublicPathMiddleware is used as one of the last middlewares in the pipeline to serve static files only if no other middleware has handled the request.

## Options
The PublicPathMiddlewareFactory accepts an options object with the following properties:
- `path` (required): The path to the directory containing the static files.
- `indexFiles` (optional): An array of index file names to serve when a directory is requested. Default is `['index.html']`.
- `generateIndex` (optional): A boolean flag to generate an index file listing when a directory is requested. Default is `false`.
- `cache.maxAge` (optional): The `max-age` value in seconds for the `Cache-Control` header. Default is `0`.

## Middleware Lifecycle
1. **Request Processing:** The middleware checks if the requested path matches a file in the specified directory.
2. **Response Handling:** If a file is found, it is served with the appropriate `Content-Type` header and cache settings.
3. **Error Handling:** If the file is not found or an error occurs, the middleware passes control to the next middleware in the pipeline.
