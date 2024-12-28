# Configuration Guide
Midori's configuration system is built around **Config Providers**, which allow you to define and manage application settings in a modular and scalable way.

## Overview
A **Config Provider** is a class that extends `ConfigProvider` and registers configurations into the application. These configurations can then be accessed and used by various components, such as middleware, services, and routes.

## Creating a Config Provider
To create a custom Config Provider:

1. Extend the `ConfigProvider` class.
2. Implement the `register` method to define your configuration.

### Example: Custom Config Provider
```ts
import { ConfigProvider } from 'midori/app';

class MyConfigProvider extends ConfigProvider<Record<string, unknown>> {
    static config = Symbol('MyConfig');

    register() {
        return {
            appName: 'MyMidoriApp',
            port: 8080,
            debug: true,
        };
    }
}
```

## Using Config Providers
### Step 1: Register the Config Provider
Register your custom Config Provider in the application:
```ts
// Register the custom Config Provider
server.configure(MyConfigProvider);
```

### Step 2: Access Configuration Values
Access configuration values anywhere in your application:
```ts
const appConfig = server.config.get(MyConfigProvider);

console.log(appConfig.appName); // Output: MyMidoriApp
```

## Built-in Config Providers
Midori includes several built-in Config Providers to simplify common tasks:
- CORSConfigProvider: Configures Cross-Origin Resource Sharing (CORS).
- ContentSecurityPolicyConfigProvider: Configures Content Security Policy (CSP).
- ResponseConfigProvider: Configures response settings, such as compression.

### Example: Configuring CORS
```ts
import { CORSConfigProviderFactory } from 'midori/providers';

server.configure(CORSConfigProviderFactory({
    origin: '*',
    methods: ['GET', 'POST'],
}));
```
For more information on CORS configuration, refer to the [CORS Provider Reference Guide](../reference/providers/cors.md).

### Example: Configuring CSP
```ts
import { ContentSecurityPolicyConfigProviderFactory } from 'midori/providers';

server.configure(ContentSecurityPolicyConfigProviderFactory({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
    },
}));
```
For more information on CSP configuration, refer to the [CSP Provider Reference Guide](../reference/providers/.md).

## Best Practices
- Centralize Configurations: Use Config Providers to keep settings organized and easily manageable.
- Environment Variables: Load sensitive data, such as API keys, from environment variables using libraries like dotenv.
- Validation: Validate configuration values to ensure consistency and prevent errors.
- Separate Environments: Maintain separate configurations for development, testing, and production environments.

Midori's configuration system ensures that your application remains flexible and maintainable, even as it scales.
