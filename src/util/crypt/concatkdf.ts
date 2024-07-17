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

import { createHash } from 'node:crypto';

import { encodeUInt32BE } from '../buffer.js';

/**
 * Concatenation Key Derivation Function, as defined in NIST SP 800-56A, section 5.8.1.
 */
export default class ConcatKDF {
    /**
     * Derive a key using the Concatenation Key Derivation Function.
     *
     * @param shaVersion The SHA version to use (1, 256, 384 or 512)
     * @param sharedSecret The shared secret
     * @param keyLengthBits The length of the derived key in bits
     * @param otherInfo The other info to be included in the key derivation
     *
     * @returns The derived key
     */
    static deriveKey(shaVersion: 1 | 256 | 384 | 512, sharedSecret: Buffer, keyLengthBits: number, otherInfo: Buffer | null): Buffer {
        const digestLengthBits = this.getDigestLengthBits(shaVersion);

        const buffer: Buffer[] = [];

        for (let i = 1; i <= this.computeDigestCycles(digestLengthBits, keyLengthBits); i++) {
            const md = createHash(`sha${shaVersion}`);

            md.update(encodeUInt32BE(i));
            md.update(sharedSecret);
            if (otherInfo) {
                md.update(otherInfo);
            }

            const hash = md.digest();
            buffer.push(hash);
        }

        const derivedKey = Buffer.concat(buffer);
        return derivedKey.subarray(0, keyLengthBits / 8);
    }

    /**
     * Compute the number of digest cycles needed to derive a key.
     *
     * @param digestLengthBits The length of the digest in bits
     * @param keyLengthBits The length of the derived key in bits
     *
     * @returns The number of digest cycles needed
     */
    static computeDigestCycles(digestLengthBits: number, keyLengthBits: number): number {
        return (keyLengthBits + digestLengthBits - 1) / digestLengthBits;
    }

    /**
     * Get the length of the digest in bits for a given SHA version.
     *
     * @param shaVersion The SHA version
     *
     * @returns The length of the digest in bits
     */
    static getDigestLengthBits(shaVersion: 1 | 256 | 384 | 512): number {
        if (shaVersion === 1) {
            return 160;
        }

        return shaVersion;
    }
}
