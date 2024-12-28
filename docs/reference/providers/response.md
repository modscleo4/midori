## Response Config Provider Reference
The `ResponseConfigProvider` is a configuration provider that registers the `Response` configuration.

### Usage
```ts
import { ResponseConfigProviderFactory } from 'midori/providers';

server.configure(ResponseConfigProviderFactory({
    compression: {
        // Whether to enable compression.
        enabled: true,
        // An array of content types to compress.
        contentTypes: ['text/html', 'text/plain'],
        // The default compression algorithm to use.
        defaultAlgorithm: CompressionAlgorithm.BROTLI,
        // The order of compression algorithms to try.
        order: [CompressionAlgorithm.BROTLI, CompressionAlgorithm.GZIP, CompressionAlgorithm.DEFLATE],
        // The compression levels for each algorithm.
        levels: {
            [CompressionAlgorithm.BROTLI]: 4,
            [CompressionAlgorithm.GZIP]: 6,
            [CompressionAlgorithm.DEFLATE]: 6
        }
    }
}));
```
