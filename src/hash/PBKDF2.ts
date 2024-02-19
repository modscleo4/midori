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

import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";

import Hash from "./Hash.js";

/**
 * PBKDF2 Hash implementation.
 *
 * Format: `$pbkdf2$<digest>$<iterations>$<cost>$<salt>$<hash>`
 */

export default class PBKDF2 extends Hash {
    static version: string = 'pbkdf2';

    override hash(data: string | Buffer, options?: { salt?: Buffer; cost?: number; iterations?: number; digest?: string }): string {
        const salt       = options?.salt ?? randomBytes(16);
        const cost       = options?.cost || 10;
        const iterations = options?.iterations || 100000;
        const digest     = options?.digest || 'sha512';
        const hashData   = pbkdf2Sync(data, salt, iterations, 1 << cost, digest).toString('base64');

        return ['', PBKDF2.version, digest, iterations, cost, salt.toString('base64'), hashData].join('$');
    }

    override verify(hash: string, data: string | Buffer): boolean {
        const [, version, digest, iterations, cost, salt] = hash.split('$', 7);
        if (version !== PBKDF2.version) {
            return false;
        }

        const computedHash = this.hash(data, { salt: Buffer.from(salt, 'base64'), cost: parseInt(cost), iterations: parseInt(iterations), digest });

        return timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
    }
}
