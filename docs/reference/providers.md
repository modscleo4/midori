# Provider Module Reference
Providers in Midori are key to configuring and extending the framework. They enable modularity by allowing you to register configurations and services into the application.

## Overview
There are two main types of providers in Midori:
1. **Config Providers:** Define and register configurations to be used throughout the application.
2. **Service Providers:** Define and register services, such as utilities or components, that can be injected into other parts of the application.
Both are abstract classes that require implementation for your specific needs.

## Config Providers
Config Providers manage and inject configurations into the application. These configurations often control middleware behavior, application settings, or module-specific options.

### Creating a Config Provider
To create a Config Provider, extend the `ConfigProvider` abstract class and implement the `register` method:
```ts
import { ConfigProvider } from 'midori/app';

class MyConfigProvider extends ConfigProvider<Record<string, unknown>> {
	static config = Symbol('MyConfig');

    register(app) {
		const config = {
		    settingA: true,
	        settingB: 'value',
	    };

	    return config;
	}
}
```

### Using a Config Provider
To use your custom Config Provider in the application:
```ts
server.configure(MyConfigProvider);

const config = server.config.get(MyConfigProvider);
console.log(config.settingA); // true
```

### Builtin Config Providers
- [ContentSecurityPolicyConfigProvider](./providers/content-security-policy-config.md) - Config Provider for `ContentSecurityPolicyMiddleware`.
- [CORSConfigProvider](./providers/cors-config.md) - Config Provider for `CORSMiddleware`.
- [ErrorConfigProvider](./providers/error-config.md) - Config Provider for `ErrorMiddleware`.
- [JWTConfigProvider](./providers/jwt-config.md) - Config Provider for `JWT`.
- [PublicPathConfigProvider](./providers/public-path-config.md) - Config Provider for `PublicPathMiddleware`.
- [RequestConfigProvider](./providers/request-config.md) - Config Provider for `Request` related services.
- [ResponseConfigProvider](./providers/response-config.md) - Config Provider for `Response` related services.

## Service Providers
Service Providers manage and inject services into the application. These services can include logging, authentication, or any other reusable functionality.

### Creating a Service Provider
To create a Service Provider, extend the `ServiceProvider` abstract class and implement the `register` method:
```ts
import { ServiceProvider } from 'midori/app';

class MyService {
	greet() {
	    return 'Hello from MyService!';
    }
}

class MyServiceProvider extends ServiceProvider<MyService> {
	static service = Symbol('MyService');

    register(app) {
		const service = new MyService();

	    return service;
	}
}
```

### Using a Service Provider
To use your custom Service Provider in the application:
```ts
server.install(MyServiceProvider);

const myService = server.services.get(MyServiceProvider);
console.log(myService.greet()); // \"Hello from MyService!\"
```

### Builtin Service Providers
- [AuthServiceProvider](./providers/auth-service.md) - Service Provider for `Auth` service.
- [HashServiceProvider](./providers/hash-service.md) - Service Provider for `Hash` service.
- [JWTServiceProvider](./providers/jwt-service.md) - Service Provider for `JWT`.
- [LoggerServiceProvider](./providers/logger-service.md) - Service Provider for `Logger` service.
- [RouterServiceProvider](./providers/router-service.md) - Service Provider for `Router` service.
- [UserServiceProvider](./providers/user-service.md) - Service Provider for `UserService` service.

## Best Practices
- Use Config Providers for static or application-wide settings.
- Use Service Providers for reusable functionality or components.
- Always use unique `Symbol` values for each provider to avoid conflicts.
- Keep your providers focused on a single responsibility.

With Config and Service Providers, you can make your Midori application modular, maintainable, and extensible.
