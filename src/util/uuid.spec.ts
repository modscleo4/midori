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

import { describe, it } from 'node:test';
import { strictEqual, ok } from 'node:assert';

import { generateUUID, validateUUID } from './uuid.js';

await describe('UUID', async () => {
    await it('should generate a UUID v4', () => {
        const uuid = generateUUID(4);

        ok(uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
    });

    await it('should generate a UUID v7', () => {
        const uuid = generateUUID(7);

        ok(uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
    });

    await it('should throw an error for an invalid version', () => {
        try {
            generateUUID(6);
        } catch (error) {
            strictEqual(error instanceof RangeError, true);
        }
    });

    await it('should validate the UUID v4 format', () => {
        ok(validateUUID(generateUUID(4), 4));
    });

    await it('should validate the UUID v7 format', () => {
        ok(validateUUID(generateUUID(7), 7));
    });

    await it('should not validate an invalid UUID', () => {
        ok(!validateUUID('invalid-uuid'));
    });

    await it('should validate a known UUID v4', () => {
        ok(validateUUID('aef93377-0a1f-4845-b3b5-dcab5e3bccd5'));
    });

    await it('should validate a known UUID v7', () => {
        ok(validateUUID('018e6541-247f-7299-8d7b-d4fe2e4b946e', 7));
    });
});
