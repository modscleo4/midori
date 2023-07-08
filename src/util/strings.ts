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
