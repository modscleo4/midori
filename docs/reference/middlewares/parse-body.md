# ParseBodyMiddleware Reference
The `ParseBodyMiddleware` middleware parses the request body based on the `Content-Type` header. It supports `application/json`, `application/json-bigint`, `application/x-www-form-urlencoded`, and `multipart/form-data` content types.

## Usage
```ts
import { ParseBodyMiddleware } from 'midori/middlewares';

server.pipe(ParseBodyMiddleware);
```

## Options
The `ParseBodyMiddleware` provides the `installParser` method to add custom parsers for additional content types.
Additionally, you can throw 415 errors for unsupported content types by setting the `errorOnUnknownContentType` option to `true`.

## Configuration
See the [ParseBodyConfigProvider](../providers/parse-body.md) documentation for details on how to configure the `ParseBodyMiddleware`.

### Example
```ts
import { ParseBodyMiddleware } from 'midori/middlewares';
import { Request } from 'midori/http';
import { XMLNode } from 'midori/util/xml.js';

class MyParseBodyMiddleware extends ParseBodyMiddleware {
    constructor() {
        super();
        this.installParser(
            'application/xml',
            async (req: Request, enc: BufferEncoding = 'utf8'): Promise<XMLNode> => { ... }
        );
    }
}
```

## Middleware Lifecycle
1. **Request Processing:** The middleware parses the request body based on the `Content-Type` header.
2. **Next Function:** The middleware passes control to the next middleware using the `next` function.
