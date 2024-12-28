# CORSMiddleware Reference
The `CORSMiddleware` class in Midori provides Cross-Origin Resource Sharing (CORS) support for your server. It allows you to control which origins can access your resources and what methods are allowed.

## Usage
To enable CORS for your server, pipe the `CORSMiddleware` class to your server instance.
```ts
import { CORSMiddleware } from 'midori/middlewares';

server.pipe(CORSMiddleware);
```

By default, the `CORSMiddleware` class does not allow any cross-origin requests. You can customize the behavior by passing an options object as an argument to the Factory.
```ts
import { CORSMiddlewareFactory } from 'midori/middlewares';

server.pipe(CORSMiddlewareFactory({
    origin: 'https://example.com',
    methods: ['GET', 'POST'],
    headers: ['Content-Type'],
    credentials: true,
    maxAge: 3600,
    openerPolicy: 'same-origin',
    embedderPolicy: 'require-corp'
}));
```

You can also use the [CORSConfigProvider](../providers/cors.md) class to define a CORS configuration and reuse it across multiple middleware instances.

## Options
The `CORSMiddleware` class accepts the following options:
- `origin`: A string or an array of strings representing the allowed origins. Sets the `Access-Control-Allow-Origin` header.
- `methods`: An array of strings representing the allowed HTTP methods. Sets the `Access-Control-Allow-Methods` header.
- `headers`: An array of strings representing the allowed headers. Sets the `Access-Control-Allow-Headers` header.
- `credentials`: A boolean indicating whether credentials are allowed. Sets the `Access-Control-Allow-Credentials` header.
- `maxAge`: An integer representing the maximum age of the preflight request. Sets the `Access-Control-Max-Age` header.
- `openerPolicy`: A string representing the opener policy for cross-origin windows. Can be `same-origin`, `same-origin-allow-popups`, or `unsafe-none`. Sets the `Cross-Origin-Opener-Policy` header.
- `embedderPolicy`: A string representing the embedder policy for cross-origin iframes. Can be `require-corp` or `unsafe-none`. Sets the `Cross-Origin-Embedder-Policy` header.

## Middleware Lifecycle
1. **Request Processing:** The middleware intercepts the request before it reaches the main handler.
2. **Response Handling:** The middleware adds the necessary CORS headers to the response.
