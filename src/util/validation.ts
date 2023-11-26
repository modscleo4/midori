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

export type CustomValidation<T> = {
    validator: (value: T) => boolean,
    message: string,
};

/**
 * Base interface for validation rules.
 */
interface BaseValidationRule<T> {
    required: boolean,
    nullable?: boolean,
    oneOf?: T[],
    customValidations?: CustomValidation<T>[],
}

type StringValidationRule = BaseValidationRule<string> & {
    type: 'string',
    min?: number,
    max?: number,
};

type NumberValidationRule = BaseValidationRule<number> & {
    type: 'number',
    min?: number,
    max?: number,
};

type BooleanValidationRule = BaseValidationRule<boolean> & {
    type: 'boolean',
};

type ObjectValidationRule = BaseValidationRule<object> & {
    type: 'object',
};

type SymbolValidationRule = BaseValidationRule<symbol> & {
    type: 'symbol',
};

type UndefinedValidationRule = BaseValidationRule<undefined> & {
    type: 'undefined',
};

type ValidationRule = StringValidationRule
    | NumberValidationRule
    | BooleanValidationRule
    | ObjectValidationRule
    | SymbolValidationRule
    | UndefinedValidationRule;

export type ValidatonRules = Record<string, ValidationRule>;
