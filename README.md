# Midori
A Node.js Web API Framework WITHOUT Express

Midori is new opinionated Web API Framework designed for Node.js, using Node.js's native HTTP module as basis and built with TypeScript and being inspired from PSR standards.

## Features
- [x] Router
- [x] Basic Middlewares
- [x] Request and Response
- [x] Error Handling
- [x] Service Providers
- [x] Config Providers
- [x] JWT
- [x] CORS
- [x] Static Files
- [x] Body Parser
- [x] Hashing (Scrypt, PBKDF2) using native Node.js `node:crypto` module

## Structure
The framework is designed to be as simple as possible, while still being powerful and flexible. As such, it is distributed in the following modules:

### midori/app
The App module is the main module of the framework. It is responsible for bootstrapping the application, loading service providers, config providers, middlewares, routes and starting the server.
- `ConfigProvider` - Abstract class designed for config providers. Install on the app using `app.configure(DerivedConfigProvider)` and retrieve using `app.config.get(DerivedConfigProvider)`.
- `ServiceProvider` - Abstract class designed for service providers. Install on the app using `app.install(DerivedServiceProvider)` and retrieve using `app.service.get(DerivedServiceProvider)`.
- `Server` - Midori's implementation of HTTP server using Node.js's native HTTP module. It is responsible for listening to requests and sending responses, as well as being the container for Configurations and Services installed on the app using `app.configure` and `app.install` respectively.

### midori/auth
The Auth module is responsible for handling authentication and authorization.
- `Auth` - Base Auth Service class using UserService to authenticate and authorize users, storing the user in the request Container.
- `User` - Base User class used by Auth Service.
- `UserService` - Abstract User Service class used by Auth Service responsible for fetching users from the source.

### midori/errors
The Errors module is responsible for handling errors.
- `AuthError` - Base class for authentication/authorization errors.
- `HttpError` - Base class for HTTP errors. It is designed to be caught and treated by `ErrorMiddleware`.
- `JWTError` - Base class for JWT errors, thrown by `JWT`.
- `UnknownServiceError` - Error thrown when a service is not found in the Service Container.

### midori/hash
The Hash module is responsible for generating secure hashes and verifying them.
- `Hash` - Abstract Hash Service class responsible for generating and verifying hashes.
- `PBKDF2` - Hash Service class using PBKDF2 algorithm.
- `Scrypt` - Hash Service class using Scrypt algorithm.

### midori/http
The HTTP module is responsible for handling HTTP requests and responses.
- `EStatusCode` - Enum for all HTTP status codes.
- `Handler` - Abstract class for all handlers. You can also implement a handler as a function.
```ts
const handler = async (req: Request, app: Application): Promise<Response> {
    // ...
}
```
- `Middleware` - Abstract class for all middlewares. You can also implement a middleware as a function.
```ts
const middleware = async (req: Request, next: (req: Request) => Promise<Response>, app: Application): Promise<Response> {
    // ...
}
```
- `Request` - Class representing an HTTP request, extending Node.js's `IncomingMessage`.
- `Response` - Class representing an HTTP response. It does NOT extend Node.js's `ServerResponse`, as it is designed to be sent only at the end of the pipeline.

### midori/jwt
The JWT module is responsible for handling JSON Web Tokens.
- `JWT` - Class responsible for signing and verifying (JWS), encrypting and decrypting (JWE).

### midori/log
The Log module is responsible for logging.
- `Logger` - Abstract class for all loggers.
- `ConsoleLogger` - Logger class using `console.log` and `console.error`.
- `FileLogger` - Logger class using Node.js's native `node:fs/promises` module.

### midori/middlewares
The Middlewares module is responsible for providing basic middlewares to be used by the application.
- `AuthBasicMiddleware` - Middleware for Basic Authentication.
- `AuthBearerMiddleware` - Middleware for Bearer Authentication.
- `ContentLengthMiddleware` - Middleware to send the Content-Length header to the client. It is automatically installed on the app as the first middleware.
- `ContentSecurityPolicyMiddleware` - Middleware for Content Security Policy. Can be configured using `app.configure(ContentSecurityPolicyConfigProviderFactory({ ... }))`.
- `CORSMiddleware` - Middleware for Cross-Origin Resource Sharing. Can be configured using `app.configure(CORSConfigProviderFactory({ ... }))`.
- `DispatchMiddleware` - Middleware to dispatch the request to the handler. It uses the `Router` to find the handler for the request.
- `ErrorLoggerMiddleware` - Middleware to log errors thrown anywhere in the pipeline using the `Logger` installed on the app.
- `ErrorMiddleware` - Middleware to handle any errors thrown anywhere in the pipeline. It should be one of the first middlewares installed on the app. Can be configured using `app.configure(ErrorConfigProviderFactory({ ... }))`.
- `HTTPErrorMiddleware` - Middleware to handle `HttpError`s thrown anywhere in the pipeline.
- `ImplicitHeadMiddleware` - Middleware to handle implicit HEAD requests, returning the same response as the corresponding GET request but without the body.
- `ImplicitOptionsMiddleware` - Middleware to handle implicit OPTIONS requests, returning the allowed methods for the requested path using the `Router`.
- `MethodNotAllowedMiddleware` - Middleware to handle requests with matching path but not matching method, returning a `405 Method Not Allowed` response.
- `NotFoundMiddleware` - Middleware intended to be the last middleware in the pipeline, returning a `404 Not Found` response.
- `ParseBodyMiddleware` - Middleware to parse the request body based on the `Content-Type` header.
- `PublicPathMiddleware` - Middleware to serve static files from a public path. Can be configured using `app.configure(PublicPathConfigProviderFactory({ ... }))`.
- `RequestLoggerMiddleware` - Middleware to log requests using the `Logger` installed on the app.
- `ResponseCompressionMiddleware` - Middleware to compress responses using `node:zlib` module. Can be configured using `app.configure(ResponseConfigProviderFactory({ compression: { ... } }))`.
- `RouterMiddleware` - Middleware to find the handler for the request using the `Router`.
- `ValidationMiddleware` - Abstract class for validation middlewares.

### midori/providers
The Providers module is responsible for providing basic providers to be used by the application.
- `AuthServiceProvider` - Service Provider for `Auth` service.
- `ContentSecurityPolicyConfigProvider` - Config Provider for `ContentSecurityPolicyMiddleware`.
- `CORSConfigProvider` - Config Provider for `CORSMiddleware`.
- `ErrorConfigProvider` - Config Provider for `ErrorMiddleware`.
- `HashServiceProvider` - Service Provider for `Hash` service.
- `JWTConfigProvider` - Config Provider for `JWT`.
- `JWTServiceProvider` - Service Provider for `JWT`.
- `LoggerServiceProvider` - Service Provider for `Logger` service.
- `PublicPathConfigProvider` - Config Provider for `PublicPathMiddleware`.
- `RequestConfigProvider` - Config Provider for `Request` related services.
- `ResponseConfigProvider` - Config Provider for `Response` related services.
- `RouterServiceProvider` - Service Provider for `Router` service.
- `UserServiceProvider` - Service Provider for `UserService` service.

### midori/router
The Router module is responsible for routing requests to handlers.
- `Route` - Class representing a route, containing the path, method, handler and middlewares.
- `Router` - Class responsible for storing routes and finding the correct handler for a request.

### midori/util
The Util module is responsible for providing utility functions used by the framework.
