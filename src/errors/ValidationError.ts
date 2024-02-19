/**
 * Copyright 2023 Dhiego Cassiano Fogaça Barbosa
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

import HTTPError from './HTTPError.js';

export default class ValidationError extends HTTPError {
    constructor(
        public errors: Record<string, string[]>,
        message: string = 'Some fields are invalid',
        status: number = 400,
    ) {
        super(message, status);
    }

    override toJSON(): object {
        return {
            ...super.toJSON(),
            errors: this.errors,
        };
    }
}
