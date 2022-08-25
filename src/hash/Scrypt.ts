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

import Hash from "./Hash.js";
import { randomBytes, scryptSync } from 'crypto';

/**
 * Scrypt Hash implementation.
 */
export default class Scrypt extends Hash {
    hash(data: string, options?: { salt?: string, cost?: number; }): string {
        const salt = Buffer.from(options?.salt || randomBytes(16).toString('hex'));
        const cost = options?.cost || 10;
        return ['', '2s', cost, salt, scryptSync(data, salt, 64, { N: 1 << (cost) }).toString('hex')].join('$');
    }

    verify(hash: string, data: string): boolean {
        const [, , cost, salt, hashData] = hash.split('$');
        return this.hash(data, { salt, cost: parseInt(cost) }) === hash;
    }
}
