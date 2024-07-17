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

import { UUID, randomBytes, randomUUID } from "node:crypto";

/**
 * Generate an UUID using the `crypto` module.
 *
 * @param version UUID version to generate (4, 7, Infinity for Max UUID or null for Nil UUID)
 *
 * @returns An UUID string in the format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
 */
export function generateUUID(version: number | null = 4): UUID {
    if (version === null) {
        return '00000000-0000-0000-0000-000000000000'; // Nil UUID
    }if (version === 4) {
        return randomUUID();
    } else if (version === 7) {
        /*
         *  0              |    1          |        2      |            3
         *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
         * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         * |               |           unix_ts_ms          |               |
         * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         * |          unix_ts_ms           |  ver  |       rand_a          |
         * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         * |var|           |            rand_b             |               |
         * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         * |               |            rand_b             |               |
         * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
         */

        const timestamp = BigInt(Date.now());
        const randA = randomBytes(2); // rand_a only uses 12 bits, the other 4 bits are for the version
        const randB = randomBytes(8); // rand_b only uses 62 bits, the other 2 bits are for the variant
        const version = 7;
        const variant = 0b10; // RFC 4122 variant

        const buffer = Buffer.alloc(16); // 128 bits
        // Write timestamp (48 bits, big-endian)
        buffer.writeBigUInt64BE(timestamp << 16n, 0);
        // Write version (4 bits, big-endian) and randA (16 bits, big-endian)
        buffer.writeUInt16BE((version << 12) | (randA.readUInt16BE(0) & 0x0FFF), 6);
        // Write variant (2 bits, big-endian) and randB (62 bits, big-endian)
        buffer.writeBigUInt64BE((BigInt(variant) << 62n) | BigInt(randB.readBigUInt64BE(0) & 0x3FFFFFFFFFFFFFFFn), 8);

        return `${buffer.toString('hex', 0, 4)}-${buffer.toString('hex', 4, 6)}-${buffer.toString('hex', 6, 8)}-${buffer.toString('hex', 8, 10)}-${buffer.toString('hex', 10, 16)}`;
    } else if (version === Infinity) {
        return 'ffffffff-ffff-ffff-ffff-ffffffffffff'; // Max UUID
    }

    throw new RangeError(`Invalid UUID version: ${version}`);
}

/**
 * Validate an UUID
 *
 * @param uuid UUID to validate
 * @param version UUID version to validate (-1 to ignore)
 *
 * @returns Whether the UUID is valid or not according to the version
 */
export function validateUUID(uuid: string, version: number = 4): boolean {
    if (uuid.length !== 36) return false; // UUIDs have 36 characters no matter the version

    if (!/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(uuid)) {
        // Didn't match the UUID format
        return false;
    }

    if (version === -1) {
        // Ignore version
        return true;
    }

    const versionChar = parseInt(uuid[14], 16);
    if (versionChar !== version) {
        // Version doesn't match
        return false;
    }

    if (version === 4) {
        // Version 4 UUIDs are random
    } else if (version === 7) {
        // Version 7 UUIDs are timestamp-based
        const timestamp = BigInt(parseInt(uuid.substring(0, 8), 16) << 16 | parseInt(uuid.substring(9, 13), 16));
        const variant = (parseInt(uuid[19], 16) >> 2) & 0b11;

        if (variant !== 0b10) {
            // Invalid variant
            return false;
        }
    }

    return true;
}
