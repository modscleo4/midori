/**
 * Copyright 2022 Dhiego Cassiano Fogaça Barbosa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Application } from "../app/Server.js";
import HTTPError from "../errors/HTTPError.js";
import ValidationError from "../errors/ValidationError.js";
import { EStatusCode } from "../http/EStatusCode.js";
import Middleware from "../http/Middleware.js";
import type Request from "../http/Request.js";
import Response from "../http/Response.js";
import { fakeAssert } from "../util/types.js";
import type { ValidatonRules, CustomValidation } from "../util/validation.js";

type Errors = Record<string, string[]>;

export default abstract class ValidationMiddleware extends Middleware {
    constructor(app: Application) {
        super(app);
    }

    abstract get rules(): ValidatonRules;

    /**
     * Validates a request body based on a set of rules.
     * @param body The request body (or any object) to be validated.
     * @param rules The rules to validate each field of the body param.
     * @returns A dictionary with the errors found in each field.
     */
    validate(body: Record<string, unknown>, rules: ValidatonRules): Errors {
        const errors: Errors = {};

        for (const [key, rule] of Object.entries(rules)) {
            const entryErrors: string[] = [];

            if (rule.required && !(key in body)) {
                entryErrors.push('This field is required.');
            }

            if (key in body) {
                const value = body[key];

                if (rule.nullable === false && value == null) {
                    entryErrors.push('This field cannot be null.');
                }

                if (
                    rule.type === 'array' && !Array.isArray(value)
                    || typeof value !== rule.type
                ) {
                    entryErrors.push(`expected type '${rule.type}' but got '${typeof value}'.`);
                }

                if (rule.oneOf && !(rule.oneOf as unknown[]).includes(value)) {
                    entryErrors.push(`expected one of [${rule.oneOf.join(', ')}] but got '${value}'.`);
                }

                if (rule.type === 'string') {
                    fakeAssert(typeof value === 'string');
                    if (rule.min && value.length < rule.min) {
                        entryErrors.push(`expected a minimum of ${rule.min} characters but got ${value.length}.`);
                    }

                    if (rule.max && value.length > rule.max) {
                        entryErrors.push(`expected a maximum of ${rule.max} characters but got ${value.length}.`);
                    }

                    if (rule.regex && !rule.regex.test(value)) {
                        entryErrors.push(`expected to match '${rule.regex}' but got '${value}'.`);
                    }
                } else if (rule.type === 'number') {
                    fakeAssert(typeof value === 'number');
                    if (rule.min && value < rule.min) {
                        entryErrors.push(`expected a minimum of ${rule.min} but got ${value}.`);
                    }

                    if (rule.max && value > rule.max) {
                        entryErrors.push(`expected a maximum of ${rule.max} but got ${value}.`);
                    }

                    if (rule.integer && !Number.isInteger(value)) {
                        entryErrors.push(`expected an integer but got ${value}.`);
                    }
                } else if (rule.type === 'bigint') {
                    fakeAssert(typeof value === 'bigint');
                    if (rule.min && value < rule.min) {
                        entryErrors.push(`expected a minimum of ${rule.min} but got ${value}.`);
                    }

                    if (rule.max && value > rule.max) {
                        entryErrors.push(`expected a maximum of ${rule.max} but got ${value}.`);
                    }
                } else if (rule.type === 'object') {
                    fakeAssert(value instanceof Object);
                    if (rule.properties) {
                        const objectErrors = this.validate(value as Record<string, unknown>, rule.properties);

                        if (Object.keys(objectErrors).length > 0) {
                            entryErrors.push(...Object.values(objectErrors).flat());
                        }
                    }
                } else if (rule.type === 'array') {
                    fakeAssert(Array.isArray(value));
                    if (rule.min && value.length < rule.min) {
                        entryErrors.push(`expected a minimum of ${rule.min} items but got ${value.length}.`);
                    }

                    if (rule.max && value.length > rule.max) {
                        entryErrors.push(`expected a maximum of ${rule.max} items but got ${value.length}.`);
                    }

                    if (rule.unique && new Set(value).size !== value.length) {
                        entryErrors.push('expected all items to be unique.');
                    }

                    if (rule.all) {
                        for (const item of value) {
                            const itemErrors = this.validate({ item }, { item: rule.all });

                            if (Object.keys(itemErrors).length > 0) {
                                entryErrors.push(...Object.values(itemErrors).flat());
                            }
                        }
                    }

                    if (rule.items) {
                        for (let i = 0; i < Math.min(value.length, rule.items.length); i++) {
                            const itemErrors = this.validate({ item: value[i] }, { item: rule.items[i] });

                            if (Object.keys(itemErrors).length > 0) {
                                entryErrors.push(...Object.values(itemErrors).flat());
                            }
                        }
                    }
                }

                if (rule.customValidations) {
                    for (const customValidation of rule.customValidations as CustomValidation<any>[]) {
                        if (!customValidation.validator(value)) {
                            entryErrors.push(customValidation.message);
                        }
                    }
                }
            }

            if (entryErrors.length > 0) {
                errors[key] = entryErrors;
            }
        }

        return errors;
    }

    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        if (!req.parsedBody || typeof req.parsedBody !== 'object') {
            return Response.problem('Invalid request body.', 'Expected a JSON object as request body.', EStatusCode.BAD_REQUEST);
        }

        const errors = this.validate(req.parsedBody as Record<string, unknown>, this.rules);

        if (Object.keys(errors).length > 0) {
            throw new ValidationError(errors);
        }

        return await next(req);
    }
}
