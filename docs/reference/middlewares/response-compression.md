# ResponseCompressionMiddleware Reference
The `ResponseCompressionMiddleware` compresses the response body using Gzip, Brotli, or Deflate encoding. It automatically sets the `Content-Encoding` header based on the client's `Accept-Encoding` request header.

## Usage
```ts
import { ResponseCompressionMiddleware } from 'midori/middlewares';

server.pipe(ResponseCompressionMiddleware);
```

By default, the middleware will not compress any response. To enable compression, you can pass an options object to the middleware Factory.
```ts
import { ResponseCompressionMiddlewareFactory } from 'midori/middlewares';
import { CompressionAlgorithm } from 'midori/providers';

server.pipe(ResponseCompressionMiddlewareFactory({
    enabled: true,
    contentTypes: ['text/html', 'text/plain'],
    defaultAlgorithm: CompressionAlgorithm.BROTLI,
    order: [CompressionAlgorithm.BROTLI, CompressionAlgorithm.GZIP, CompressionAlgorithm.DEFLATE],
    levels: {
        [CompressionAlgorithm.BROTLI]: 4,
        [CompressionAlgorithm.GZIP]: 6,
        [CompressionAlgorithm.DEFLATE]: 6
    }
}));
```

You can also use the [ResponseConfigProvider](../providers/response.md) to set the default compression algorithm and levels for all responses.

## Options
The following options can be passed to the `ResponseCompressionMiddleware`:
- `enabled`: Whether to enable compression. Default: `false`.
- `contentTypes`: An array of content types to compress. Default: `[]`.
- `defaultAlgorithm`: The default compression algorithm to use. Default: `CompressionAlgorithm.BROTLI`.
- `order`: The order of compression algorithms to try. Default: `[CompressionAlgorithm.BROTLI, CompressionAlgorithm.GZIP, CompressionAlgorithm.DEFLATE]`.
- `levels`: The compression levels for each algorithm. Default: `{ [CompressionAlgorithm.BROTLI]: 5, [CompressionAlgorithm.GZIP]: 5, [CompressionAlgorithm.DEFLATE]: 5 }`.
