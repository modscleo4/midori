# Midori
A Node.js Web API Framework WITHOUT Express

Midori is an opinionated Web API Framework designed for Node.js, using Node.js's native HTTP module as basis, built with TypeScript and being inspired from PSR standards.

## Features
- [x] Router
- [x] Basic Middlewares
- [x] Request and Response
- [x] Error Handling
- [x] Service Providers
- [x] Config Providers
- [x] Logger
    - [x] Console
    - [x] File
- [x] Task Scheduler
- [x] JWT
    - [x] JWS
    - [x] JWE
    - [x] JWK
- [x] CORS
- [x] Content Security Policy
- [x] Static Files
- [x] Response Compression using `node:zlib` module
    - [x] Gzip
    - [x] Deflate
    - [x] Brotli
- [x] Extensible Body Parser and Response Serializer
    - [x] JSON+BigInt
    - [x] CSV
    - [x] Form
    - [x] Multipart
    - [x] Streams
- [x] Hashing using native Node.js `node:crypto` module
    - [x] PBKDF2
    - [x] Scrypt
    - [x] SHA-256
    - [x] SHA-512
- [x] Problem Details
- [x] Request Validation
- [x] Auth
    - [x] Basic
    - [x] Bearer

## Roadmap
- [ ] Tests
    - [x] JWE
    - [x] JWS
- [ ] Documentation
- [ ] Rate Limiting

## Installation
```bash
npm install modscleo4/midori
```

## Usage
See [HTTP Bin](https://github.com/modscleo4/httpbin) for an example project.

### Basic
```ts
// Import the node:http wrapper
import { Server } from 'midori/app';
// Import the HTTP utilities
import { Request, Response } from 'midori/http';

// Create the Server
const server = new Server();

// Install a basic Middleware
server.pipe(async (req: Request, next: (req: Request) => Promise<Response>): Promise<Response> => {
    // Return a response for all requests
    return Response.json({
        message: 'Hello World!'
    });
});

// Start the server
server.listen(8080);
```

### Using the included Router
```ts
// Import the node:http wrapper
import { Server } from 'midori/app';
// Import the HTTP utilities
import { Handler, Request, Response } from 'midori/http';
// Import the Route creator utility
import { Router } from 'midori/router';
// Import the required middlewares to support Router in the pipeline
import { RouterMiddleware, DispatchMiddleware, NotFoundMiddleware } from 'midori/middlewares';
// Import the Router Service Provider factory
import { RouterServiceProviderFactory } from 'midori/providers';

// Create a Router instance
const router = new Router();

// Create a GET route
router.get('/', async (req: Request): Promise<Response> => {
    // Return a response
    return Response.json({
        message: 'Hello World!'
    });
});

// Create the Server
const server = new Server();

// Install the Router Service Provider with the Router instance
server.install(RouterServiceProviderFactory(router));

// Install the middlewares
server.pipe(RouterMiddleware);
server.pipe(DispatchMiddleware);
server.pipe(NotFoundMiddleware);

// Start the server
server.listen(8080);
```

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
- `HTTPError` - Base class for HTTP errors (any 4xx or 5xx response). It is designed to be caught and treated by `HTTPErrorMiddleware`.
- `JWTError` - Base class for JWT errors, thrown by `JWT`.
- `UnknownServiceError` - Error thrown when a service is not found in the Service Container.

### midori/hash
The Hash module is responsible for generating secure hashes and verifying them.
- `Hash` - Abstract Hash Service class responsible for generating and verifying hashes. Use `Hash.hash` to generate a hash and `Hash.verify` to verify a hash.
```ts
import { Scrypt } from 'midori/hash'; // Or any other Hash Service you want to use

const hash = await Scrypt.hash('password'); // Can also pass a Buffer
const isTheSame = await Scrypt.verify(hash, 'password');
```
- `PBKDF2` - Hash Service class using PBKDF2 algorithm.
- `Scrypt` - Hash Service class using Scrypt algorithm.
- `SHA256` - Hash Service class using SHA-256 algorithm.
- `SHA512` - Hash Service class using SHA-512 algorithm.

### midori/http
The HTTP module is responsible for handling HTTP requests and responses.
- `EStatusCode` - Enum for all HTTP status codes.
- `Handler` - Abstract class for all handlers. You can also implement a handler as a function.
```ts
import { Application } from 'midori/app';
import { Request, Response } from 'midori/http';

const handler = async (
    req: Request,
    app: Application
): Promise<Response> {
    // ...
}
```
- `Middleware` - Abstract class for all middlewares. You can also implement a middleware as a function.
```ts
import { Application } from 'midori/app';
import { Request, Response } from 'midori/http';

const middleware = async (
    req: Request,
    next: (req: Request) => Promise<Response>,
    app: Application
): Promise<Response> {
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
- `AuthMiddleware` - Middleware to check if the user is authenticated. It uses the `Auth` service installed on the app.
- `AuthBasicMiddleware` - Middleware for Basic Authentication.
- `AuthBearerMiddleware` - Middleware for Bearer Authentication.
- `ContentLengthMiddleware` - Middleware to send the Content-Length header to the client. It is automatically installed on the app as the first middleware.
- `ContentSecurityPolicyMiddleware` - Middleware for Content Security Policy. Can be configured using `app.configure(ContentSecurityPolicyConfigProviderFactory({ ... }))`.
- `CORSMiddleware` - Middleware for Cross-Origin Resource Sharing. Can be configured using `app.configure(CORSConfigProviderFactory({ ... }))`.
- `DispatchMiddleware` - Middleware to dispatch the request to the handler. It uses the `Router` to find the handler for the request.
- `ErrorLoggerMiddleware` - Middleware to log errors thrown anywhere in the pipeline using the `Logger` installed on the app.
- `ErrorMiddleware` - Middleware to handle any errors thrown anywhere in the pipeline. It should be one of the first middlewares installed on the app. Can be configured using `app.configure(ErrorConfigProviderFactory({ ... }))`.
- `HTTPErrorMiddleware` - Middleware to handle `HTTPError`s thrown anywhere in the pipeline.
- `ImplicitHeadMiddleware` - Middleware to handle implicit HEAD requests, returning the same response as the corresponding GET request but without the body.
- `ImplicitOptionsMiddleware` - Middleware to handle implicit OPTIONS requests, returning the allowed methods for the requested path using the `Router`.
- `MethodNotAllowedMiddleware` - Middleware to handle requests with matching path but not matching method, returning a `405 Method Not Allowed` response.
- `NotFoundMiddleware` - Middleware intended to be the last middleware in the pipeline, returning a `404 Not Found` response.
- `ParseBodyMiddleware` - Middleware to parse the request body based on the `Content-Type` header.
- `PublicPathMiddleware` - Middleware to serve static files from a public path. Can be configured using `app.configure(PublicPathConfigProviderFactory({ ... }))`.
- `RequestLoggerMiddleware` - Middleware to log requests using the `Logger` installed on the app.
- `ResponseCompressionMiddleware` - Middleware to compress responses using `node:zlib` module. Can be configured using `app.configure(ResponseConfigProviderFactory({ compression: { ... } }))`.
- `RouterMiddleware` - Middleware to find the handler for the request using the `Router`.
- `ValidationMiddleware` - Abstract class for validation middlewares. The `validate` method is internally used to validate an object against a `ValidationRules` object. Define your `ValidationRules` object by extending the `ValidationMiddleware.rules` property.
```ts
import { ValidationMiddleware } from 'midori/middlewares';
import { ValidationRules } from 'midori/util/validation.js';

class MyValidationMiddleware extends ValidationMiddleware {
    override get rules(): ValidationRules {
        return {
            fieldA: {
                type: 'string',
                required: true
            },
            fieldB: {
                type: 'number',
                required: false,
                min: 15,
            },
            fieldC: {
                type: 'boolean',
                required: false,
            },
            fieldD: {
                type: 'array',
                required: false,
                all: {
                    type: 'string',
                }
            },
            fieldE: {
                type: 'object',
                required: false,
                properties: {
                    fieldA: {
                        type: 'string',
                        required: true
                    },
                }
            }
        };
    }
}
```

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

### midori/scheduler
The Scheduler module is responsible for scheduling tasks.
- `Task` - Abstract class for all tasks. You can also implement a task as a function.
```ts
import { Application } from 'midori/app';

const task = async (app: Application): Promise<void> {
    // ...
}
```
Install on the app using `app.schedule(cronString, DerivedTask)`. `cronString` is a string representing the schedule of the task using the cron format WITH seconds. For example, `* * * * * *` will run the task every second.

### midori/util
The Util module is responsible for providing utility functions used by the framework.
