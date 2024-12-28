# Service Guide
In Midori, services are reusable components that provide specific functionality, such as logging, authentication, or database access. Services are registered and managed through **Service Providers**, ensuring modularity and scalability.

## Overview
A **Service Provider** is a class that extends `ServiceProvider` and registers a service into the application. Services can then be accessed throughout the application via the service container.

## Creating a Service Provider
To create a custom Service Provider:
1. Extend the `ServiceProvider` class.
2. Implement the `register` method to define and register the service.

### Example: Custom Service Provider
```ts
import { ServiceProvider } from 'midori/app';

class MyService {
    greet() {
        return 'Hello from MyService!';
    }
}

class MyServiceProvider extends ServiceProvider<MyService> {
    static service = Symbol('MyService');

    register() {
        const service = new MyService();

        return service;
    }
}
```

## Using Service Providers
### Step 1: Register the Service Provider
Install your custom Service Provider in the application:
```ts
// Register the custom Service Provider
server.install(MyServiceProvider);
```

### Step 2: Access the Service
Retrieve the service anywhere in your application:

```ts
const myService = server.services.get(MyServiceProvider);
console.log(myService.greet()); // Output: Hello from MyService!
```

## Built-in Service Providers
Midori includes several built-in Service Providers:
1. **AuthServiceProvider:** Manages authentication services.
2. **LoggerServiceProvider:** Provides logging capabilities.
3. **HashServiceProvider:** Offers hashing utilities.

### Example: Using LoggerServiceProvider
```ts
import { LoggerServiceProvider } from 'midori/providers';

server.install(LoggerServiceProvider);

const logger = server.services.get(LoggerServiceProvider);
logger.log('This is a log message.');
```

## Dependency Injection with Services
You can use services as dependencies in other parts of your application. For example, a middleware can access a service:
```ts
import { Application } from 'midori/app';
import { Middleware, Request, Response } from 'midori/http';
import { MyServiceProvider } from './MyServiceProvider';

class MyMiddleware extends Middleware {
    myService: MyService;

    constructor(app: Application) {
        super(app);
        this.myService = app.services.get(MyServiceProvider);
    }

    async handle(req: Request, next: Function): Promise<Response> {
        console.log(myService.greet());
        return await next(req);
    }
}
```

## Best Practices
1. **Single Responsibility:** Each service should focus on a single responsibility to maintain modularity.
2. **Reuse Services:** Use services to encapsulate functionality that is shared across different parts of the application.
3. **Lazy Initialization:** Initialize services only when they are accessed to improve performance.

By using services and Service Providers effectively, you can build applications that are maintainable, testable, and scalable.
