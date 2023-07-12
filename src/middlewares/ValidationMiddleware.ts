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
import { ValidatonRules } from "../util/validation.js";

export default abstract class ValidationMiddleware extends Middleware {
    constructor(app: Application) {
        super(app);
    }

    abstract get rules(): ValidatonRules;

    async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        const errors: string[] = [];

        if (!req.parsedBody || typeof req.parsedBody !== 'object') {
            errors.push(`Expected a JSON object as request body but got '${typeof req.parsedBody}'.`);
        } else {
            for (const [key, rule] of Object.entries(this.rules)) {
                if (rule.required && !(key in req.parsedBody)) {
                    errors.push(`Missing required field '${key}'.`);
                }

                if (rule.nullable === false && req.parsedBody[key] == null) {
                    errors.push(`Invalid '${key}' field (expected a non-null value).`);
                }

                if (key in req.parsedBody && typeof req.parsedBody[key] !== rule.type) {
                    errors.push(`Invalid '${key}' field (expected type '${rule.type}' but got '${typeof req.parsedBody[key]}').`);
                }

                if (key in req.parsedBody && rule.customValidations) {
                    for (const customValidation of rule.customValidations) {
                        if (!customValidation.validator(req.parsedBody[key])) {
                            errors.push(`Invalid '${key}' field (${customValidation.message}).`);
                        }
                    }
                }
            }
        }

        if (errors.length > 0) {
            return Response.status(EStatusCode.BAD_REQUEST)
                .json({
                    message: "Invalid request body.",
                    errors,
                });
        }

        return await next(req);
    }
}
