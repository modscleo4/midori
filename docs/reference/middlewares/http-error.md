# HTTPErrorMiddleware Reference
`HTTPErrorMiddleware` is a built-in middleware that catches HTTPError instances and sends them as responses.

## Usage
```ts
import { HTTPErrorMiddleware } from 'midori/middlewares';
import { HTTPError } from 'midori/errors';
import { EStatusCode } from 'midori/http';

server.pipe(HTTPErrorMiddleware);
server.pipe((req, res) => {
    throw new HTTPError('Not Found', EStatusCode.NOT_FOUND);
});
```

When an `HTTPError` is thrown in the handler, the middleware catches it and send a response with the specified status code and message.

If you want to use with [ErrorMiddleware](./error.md), make sure to pipe `HTTPErrorMiddleware` last.
```ts
server.pipe(ErrorMiddleware);
server.pipe(HTTPErrorMiddleware);
```

## Middleware Lifecycle
1. **Request Processing:** The middleware catches `HTTPError` instances thrown in the handler.
2. **Response Handling:** The middleware sends the error response to the client.
