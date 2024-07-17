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

import { randomBytes } from "node:crypto";

/**
 * Check if a string matches a glob pattern.
 *
 * @param pattern The glob pattern, like `text/*`
 * @param search The string to be searched
 *
 * @returns `true` if the string matches the pattern, `false` otherwise.
 */
export function globMatch(pattern: string, search: string): boolean {
    const regex = new RegExp(
        pattern
            .split('*')
            .map((part) => part.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
            .join('.*'),
        'i',
    );

    return regex.test(search);
}

/**
 * Generate a random string with `n` characters using the `crypto` module.
 *
 * @param n The number of characters to generate
 *
 * @returns A random string with `n` characters
 */
export function generateRandomString(n: number): string {
    const bytes = randomBytes(n);

    return bytes.toString('hex').slice(0, n);
}

/**
 * Split a string into an array of substrings using a separator. Optionally, you can limit the number of splits and the result will combine the remaining parts into the last element.
 *
 * @param str The string to be split
 * @param separator The separator to split the string
 * @param limit The maximum number of splits
 *
 * @returns An array of substrings
 */
export function split(str: string, separator: string, limit?: number): string[] {
    const parts = str.split(separator);

    if (limit && parts.length > limit) {
        const last = parts.slice(limit - 1).join(separator);
        parts.splice(limit - 1, parts.length, last);
    }

    return parts;
}
