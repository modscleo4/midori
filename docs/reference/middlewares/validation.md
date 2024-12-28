# ValidationMiddleware Reference
The `ValidationMiddleware` class in Midori provides a way to validate incoming requests using JSON Schema. It is not designed to be used directly, but rather as a base class for creating custom validation middleware.

## Usage
To use the `ValidationMiddleware`, extend it and implement the `rules` method. This method should return a JSON Schema object that defines the expected request body.

### Example
```ts
import { Request, Response } from 'midori/http';
import { ValidationMiddleware } from 'midori/middlewares';

class MyValidationMiddleware extends ValidationMiddleware {
    get rules(): ValidatonRules {
        return {
            type: 'object',
            properties: {
                name: { type: 'string' },
                age: { type: 'number' },
            },
            required: ['name', 'age'],
        };
    }
}
```

## Middleware Lifecycle
1. **Request Processing:** The `ValidationMiddleware` checks the request body against the JSON Schema.
2. **Validation Failure:** If the request body does not match the schema, a `400 Bad Request` response is sent.
3. **Validation Success:** Control is passed to the next middleware in the pipeline.
