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

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import Hash from "./Hash.js";

/**
 * Scrypt Hash implementation.
 *
 * Format: `$7$<cost>$<salt>$<hash>`
 */
export default class Scrypt extends Hash {
    static version: string = '7';

    hash(data: string | Buffer, options?: { salt?: Buffer, cost?: number; iterations?: number; digest?: string }): string {
        const salt     = options?.salt ?? randomBytes(16);
        const cost     = options?.cost || 10;
        const hashData = scryptSync(data, salt, 64, { N: 1 << cost }).toString('base64');

        return ['', Scrypt.version, cost, salt.toString('base64'), hashData].join('$');
    }

    verify(hash: string, data: string | Buffer): boolean {
        const [, version, cost, salt] = hash.split('$', 5);
        if (version !== Scrypt.version) {
            return false;
        }

        const computedHash = this.hash(data, { salt: Buffer.from(salt, 'base64'), cost: parseInt(cost) });

        return timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
    }
}
