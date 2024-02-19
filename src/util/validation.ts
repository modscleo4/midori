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
    /** If the field is required. */
    required: boolean,
    /** If the field can be null. */
    nullable?: boolean,
    /** Enum containing the allowed values. */
    oneOf?: T[],
    /** Custom validations. */
    customValidations?: CustomValidation<T>[],
}

type StringValidationRule = BaseValidationRule<string> & {
    type: 'string',
    /** Minimum length. */
    min?: number,
    /** Maximum length. */
    max?: number,
    /** Regex to match. */
    regex?: RegExp,
};

type NumberValidationRule = BaseValidationRule<number> & {
    type: 'number',
    /** Minimum value. */
    min?: number,
    /** Maximum value. */
    max?: number,
    /** If the number must be an integer. */
    integer?: boolean,
};

type BigIntValidationRule = BaseValidationRule<bigint> & {
    type: 'bigint',
    /** Minimum value. */
    min?: bigint,
    /** Maximum value. */
    max?: bigint,
};

type BooleanValidationRule = BaseValidationRule<boolean> & {
    type: 'boolean',
};

type ObjectValidationRule = BaseValidationRule<object> & {
    type: 'object',
    /** Validation rules for the object properties. */
    properties?: ValidatonRules,
};

type SymbolValidationRule = BaseValidationRule<symbol> & {
    type: 'symbol',
};

type UndefinedValidationRule = BaseValidationRule<undefined> & {
    type: 'undefined',
};

type ArrayValidationRule = BaseValidationRule<any[]> & {
    type: 'array',
    /** Minimum length. */
    min?: number,
    /** Maximum length. */
    max?: number,
    /** Validation rules for the array items. */
    items?: ValidationRule[],
    /** Validation rule for all array items. */
    all?: ValidationRule,
    /** If the array items must be unique. */
    unique?: boolean,
};

type ValidationRule = StringValidationRule
    | NumberValidationRule
    | BigIntValidationRule
    | BooleanValidationRule
    | ObjectValidationRule
    | SymbolValidationRule
    | UndefinedValidationRule
    | ArrayValidationRule;

export type ValidatonRules = Record<string, ValidationRule>;
