# Router Guide
The Router in Midori is a powerful tool for defining and managing routes within your application. It supports various HTTP methods, route grouping, middlewares, and parameterized paths, providing flexibility and control.

## Creating a Router
To use the router, instantiate it and define your routes. You can integrate the router with your application by using `RouterMiddleware`.
```ts
import { Router } from 'midori/router';
import { Server } from 'midori/app';
import { RouterMiddleware, DispatchMiddleware, NotFoundMiddleware } from 'midori/middlewares';

// Create a router instance
const router = new Router();

// Define routes
router.get('/', async () => {
    return Response.json({ message: 'Welcome to Midori!' });
});

// Create a server and integrate the router
const server = new Server();

server.install(RouterServiceProviderFactory(router));
server.pipe(RouterMiddleware, DispatchMiddleware, NotFoundMiddleware);

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
```

## Defining Routes
The Router class allows you to define routes for different HTTP methods using intuitive methods like get, post, put, and more.
Basic Route

### Define a simple GET route:
```ts
router.get('/hello', async () => {
    return Response.json({ message: 'Hello, World!' });
});
```

### Route with Parameters
Routes can include dynamic parameters in their paths:
```ts
router.get('/user/{id:number}', async (req) => {
    const { id } = req.params;
    return Response.json({ userId: id });
});
```

Parameter types like number, uuid, and uuidv4 are validated automatically.

### Grouping Routes
Group routes with a common prefix and shared middlewares using the group method:
```ts
router.group('/api', (router) => {
    router.get('/users', async () => {
        return Response.json([{ id: 1, name: 'John' }]);
    });

    router.get('/products', async () => {
        return Response.json([{ id: 101, name: 'Widget' }]);
    });
}, [AuthMiddleware]);
```

### Adding Middlewares to Routes
Apply middlewares to specific routes:
```ts
router.post('/submit', async (req) => {
    return Response.json({ success: true });
}, [ValidateRequestBodyMiddleware]);
```

## Advanced Features
### Handling Multiple HTTP Methods
Handle other HTTP methods like POST, PUT, DELETE, OPTIONS, etc.:
```ts
router.post('/create', async () => {
    return Response.json({ status: 'Resource created' });
});
```

### Named Routes

Assign names to routes for easier referencing:
```ts
router.get('/dashboard', async () => {
    return Response.json({ message: 'Welcome to the dashboard!' });
}, [], 'dashboard');
```

Retrieve a route by its name:
```ts
const dashboardRoute = router.findByName('dashboard');
console.log(dashboardRoute.path); // Output: /dashboard
```

# Best Practices
- Use route grouping to keep your router organized.
- Validate request parameters and body with middlewares.
- Use named routes for dynamic or programmatic URL generation.
- Avoid deeply nested groups for better readability.

With Midori's Router, you can efficiently manage your application's routing logic while keeping the codebase modular and clean.
