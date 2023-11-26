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
import { EStatusCode } from "../http/EStatusCode.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import { ValidatonRules, CustomValidation } from "../util/validation.js";

export default abstract class ValidationMiddleware extends Middleware {
    constructor(app: Application) {
        super(app);
    }

    abstract get rules(): ValidatonRules;

    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const errors: Record<string, string[]> = {};

        if (!req.parsedBody || typeof req.parsedBody !== 'object') {
            return Response.status(EStatusCode.BAD_REQUEST)
                .json({
                    message: "Invalid request body.",
                    error: "Expected a JSON object as request body.",
                });
        } else {
            for (const [key, rule] of Object.entries(this.rules)) {
                const entryErrors: string[] = [];

                if (rule.required && !(key in req.parsedBody)) {
                    entryErrors.push('This field is required.');
                }

                if (key in req.parsedBody) {
                    if (rule.nullable === false && req.parsedBody[key] == null) {
                        entryErrors.push('This field cannot be null.');
                    }

                    if (typeof req.parsedBody[key] !== rule.type) {
                        entryErrors.push(`expected type '${rule.type}' but got '${typeof req.parsedBody[key]}'.`);
                    }

                    if (rule.oneOf && !(rule.oneOf as any[]).includes(req.parsedBody[key])) {
                        entryErrors.push(`expected one of [${rule.oneOf.join(', ')}] but got '${req.parsedBody[key]}'.`);
                    }

                    if (rule.type === 'string') {
                        if (rule.min && req.parsedBody[key].length < rule.min) {
                            entryErrors.push(`expected a minimum of ${rule.min} characters but got ${req.parsedBody[key].length}.`);
                        }

                        if (rule.max && req.parsedBody[key].length > rule.max) {
                            entryErrors.push(`expected a maximum of ${rule.max} characters but got ${req.parsedBody[key].length}.`);
                        }
                    } else if (rule.type === 'number') {
                        if (rule.min && req.parsedBody[key] < rule.min) {
                            entryErrors.push(`expected a minimum of ${rule.min} but got ${req.parsedBody[key]}.`);
                        }

                        if (rule.max && req.parsedBody[key] > rule.max) {
                            entryErrors.push(`expected a maximum of ${rule.max} but got ${req.parsedBody[key]}.`);
                        }
                    }

                    if (rule.customValidations) {
                        for (const customValidation of rule.customValidations as CustomValidation<any>[]) {
                            if (!customValidation.validator(req.parsedBody[key])) {
                                entryErrors.push(customValidation.message);
                            }
                        }
                    }
                }

                if (entryErrors.length > 0) {
                    errors[key] = entryErrors;
                }
            }
        }

        if (Object.keys(errors).length > 0) {
            return Response.status(EStatusCode.BAD_REQUEST)
                .json({
                    message: "Some fields are invalid.",
                    errors,
                });
        }

        return await next(req);
    }
}
