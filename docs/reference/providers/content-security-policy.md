# Content-Security-Policy Config Provider Reference
The `ContentSecurityPolicyConfigProvider` is a configuration provider that registers the `ContentSecurityPolicy` configuration.

## Usage
```ts
import { ContentSecurityPolicyConfigProviderFactory } from 'midori/providers';

server.configure(ContentSecurityPolicyConfigProviderFactory({
    connect: 'self',
    default: 'self',
    font: 'strict-dynamic',
    frame: 'strict-dynamic',
    img: 'report-sample example.com',
    manifest: 'report-sample example.com',
    media: 'unsafe-inline example.com',
    object: 'unsafe-inline example.com',
    prefetch: 'unsafe-eval example.com',
    script: 'unsafe-eval',
    scriptElem: 'unsafe-hashes',
    scriptAttr: 'unsafe-hashes',
    style: 'unsafe-allow-redirects',
    styleElem: 'unsafe-allow-redirects',
    styleAttr: '*',
    worker: '*',
}));
```
