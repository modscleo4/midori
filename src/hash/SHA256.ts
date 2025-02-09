/**
 * Copyright 2024 Dhiego Cassiano Fogaça Barbosa
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

import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import type { Readable } from "node:stream";

import Hash from "./Hash.js";

/**
 * SHA-256 Hash implementation.
 *
 * Format: `$5$<salt>$<hash>`
 *
 * Note: This should not be used for new applications.
 */

export default class SHA256 extends Hash {
    static version: string = '5';

    override hash(data: string | Buffer, options?: { salt?: Buffer; }): string {
        const salt = options?.salt ?? randomBytes(16);
        const hashData = createHash('sha256').update(data).update(createHash('sha256').update(salt).digest()).digest('base64');

        return ['', SHA256.version, salt.toString('base64'), hashData].join('$');
    }

    override verify(hash: string, data: string | Buffer): boolean {
        const [, version, salt] = hash.split('$', 4);
        if (version !== SHA256.version) {
            return false;
        }

        const computedHash = this.hash(data, { salt: Buffer.from(salt, 'base64') });

        return timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
    }

    static async hashStream(data: Readable, options?: { salt?: Buffer; }): Promise<string> {
        const salt = options?.salt ?? randomBytes(16);
        const hashData = await new Promise<string>((resolve, reject) => {
            const hash = createHash('sha256');
            hash.update(salt);

            data.on('data', (chunk) => hash.update(chunk));
            data.on('end', () => resolve(hash.digest('base64')));
            data.on('error', reject);
        });

        return ['', SHA256.version, salt.toString('base64'), hashData].join('$');
    }

    static hexHash(data: string | Buffer): string {
        return createHash('sha256').update(data).digest('hex');
    }

    static async hexHashStream(data: Readable): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const hash = createHash('sha256');

            data.on('data', (chunk) => hash.update(chunk));
            data.on('end', () => resolve(hash.digest('hex')));
            data.on('error', reject);
        });
    }
}
