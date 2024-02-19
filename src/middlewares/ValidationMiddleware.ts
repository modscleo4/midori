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


import { Application } from "../app/Server.js";
import HTTPError from "../errors/HTTPError.js";
import ValidationError from "../errors/ValidationError.js";
import { EStatusCode } from "../http/EStatusCode.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import { ValidatonRules, CustomValidation } from "../util/validation.js";


type Errors = Record<string, string[]>;

export default abstract class ValidationMiddleware extends Middleware {
    constructor(app: Application) {
        super(app);
    }

    abstract get rules(): ValidatonRules;

    validate(body: Record<string, any>, rules: ValidatonRules): Errors {
        const errors: Errors = {};

        for (const [key, rule] of Object.entries(rules)) {
            const entryErrors: string[] = [];

            if (rule.required && !(key in body)) {
                entryErrors.push('This field is required.');
            }

            if (key in body) {
                if (rule.nullable === false && body[key] == null) {
                    entryErrors.push('This field cannot be null.');
                }

                if (
                    rule.type === 'array' && !Array.isArray(body[key])
                    || typeof body[key] !== rule.type
                ) {
                    entryErrors.push(`expected type '${rule.type}' but got '${typeof body[key]}'.`);
                }

                if (rule.oneOf && !(rule.oneOf as any[]).includes(body[key])) {
                    entryErrors.push(`expected one of [${rule.oneOf.join(', ')}] but got '${body[key]}'.`);
                }

                if (rule.type === 'string') {
                    if (rule.min && body[key].length < rule.min) {
                        entryErrors.push(`expected a minimum of ${rule.min} characters but got ${body[key].length}.`);
                    }

                    if (rule.max && body[key].length > rule.max) {
                        entryErrors.push(`expected a maximum of ${rule.max} characters but got ${body[key].length}.`);
                    }

                    if (rule.regex && !rule.regex.test(body[key])) {
                        entryErrors.push(`expected to match '${rule.regex}' but got '${body[key]}'.`);
                    }
                } else if (rule.type === 'number') {
                    if (rule.min && body[key] < rule.min) {
                        entryErrors.push(`expected a minimum of ${rule.min} but got ${body[key]}.`);
                    }

                    if (rule.max && body[key] > rule.max) {
                        entryErrors.push(`expected a maximum of ${rule.max} but got ${body[key]}.`);
                    }

                    if (rule.integer && !Number.isInteger(body[key])) {
                        entryErrors.push(`expected an integer but got ${body[key]}.`);
                    }
                } else if (rule.type === 'bigint') {
                    if (rule.min && body[key] < rule.min) {
                        entryErrors.push(`expected a minimum of ${rule.min} but got ${body[key]}.`);
                    }

                    if (rule.max && body[key] > rule.max) {
                        entryErrors.push(`expected a maximum of ${rule.max} but got ${body[key]}.`);
                    }
                } else if (rule.type === 'object') {
                    if (rule.properties) {
                        const objectErrors = this.validate(body[key], rule.properties);

                        if (Object.keys(objectErrors).length > 0) {
                            entryErrors.push(...Object.values(objectErrors).flat());
                        }
                    }
                } else if (rule.type === 'array') {
                    if (rule.min && body[key].length < rule.min) {
                        entryErrors.push(`expected a minimum of ${rule.min} items but got ${body[key].length}.`);
                    }

                    if (rule.max && body[key].length > rule.max) {
                        entryErrors.push(`expected a maximum of ${rule.max} items but got ${body[key].length}.`);
                    }

                    if (rule.unique && new Set(body[key]).size !== body[key].length) {
                        entryErrors.push('expected all items to be unique.');
                    }

                    if (rule.all) {
                        for (const item of body[key]) {
                            const itemErrors = this.validate({ item }, { item: rule.all });

                            if (Object.keys(itemErrors).length > 0) {
                                entryErrors.push(...Object.values(itemErrors).flat());
                            }
                        }
                    }

                    if (rule.items) {
                        for (let i = 0; i < Math.min(body[key].length, rule.items.length); i++) {
                            const itemErrors = this.validate({ item: body[key][i] }, { item: rule.items[i] });

                            if (Object.keys(itemErrors).length > 0) {
                                entryErrors.push(...Object.values(itemErrors).flat());
                            }
                        }
                    }
                }

                if (rule.customValidations) {
                    for (const customValidation of rule.customValidations as CustomValidation<any>[]) {
                        if (!customValidation.validator(body[key])) {
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
            return Response.status(EStatusCode.BAD_REQUEST)
                .json({
                    message: "Invalid request body.",
                    error: "Expected a JSON object as request body.",
                });
        }

        const errors = this.validate(req.parsedBody, this.rules);

        if (Object.keys(errors).length > 0) {
            throw new ValidationError(errors);
        }

        return await next(req);
    }
}
