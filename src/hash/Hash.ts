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
 * Provides a hash function for strings.
 */
export default abstract class Hash {
    /**
     * Creates a hash from the specified string.
     */
    abstract hash(data: string | Buffer, options?: { salt?: Buffer, cost?: number; iterations?: number; digest?: string }): string;

    /**
     * Compares the specified hash with the specified string.
     */
    abstract verify(hash: string, data: string | Buffer): boolean;
}
