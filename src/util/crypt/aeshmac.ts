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

import { createCipheriv, createDecipheriv, createHmac } from "node:crypto";

/**
 * Advanced Encryption Standard (Cipher Block Chaining) + Hash-based Message Authentication Code, as used by JWE.
 */
export default class AESHMAC {
    static encrypt(aesVersion: 128 | 192 | 256, shaVersion: 256 | 384 | 512, cek: Buffer, iv: Buffer, aad: Buffer, plainText: Buffer): { cipherText: Buffer; authenticationTag: Buffer; } {
        const macKey = cek.subarray(0, aesVersion / 8);
        const encKey = cek.subarray(aesVersion / 8, cek.length);

        const cipher = createCipheriv(`aes-${aesVersion}-cbc`, encKey, iv);
        const cipherText = Buffer.concat([cipher.update(plainText), cipher.final()]);

        const al = Buffer.alloc(8);
        al.writeBigUInt64BE(BigInt(aad.length * 8), 0);

        const hmacInput = Buffer.concat([aad, iv, cipherText, al]);

        const hmac = createHmac(`sha${shaVersion}`, macKey);
        hmac.update(hmacInput);
        const authenticationTag = hmac.digest();

        return { cipherText, authenticationTag: authenticationTag.subarray(0, authenticationTag.length / 2) };
    }

    static decrypt(aesVersion: 128 | 192 | 256, shaVersion: 256 | 384 | 512, cek: Buffer, iv: Buffer, aad: Buffer, cipherText: Buffer, authenticationTag: Buffer): Buffer {
        const macKey = cek.subarray(0, aesVersion / 8);
        const encKey = cek.subarray(aesVersion / 8, cek.length);

        const al = Buffer.alloc(8);
        al.writeBigUInt64BE(BigInt(aad.length * 8), 0);

        const hmacInput = Buffer.concat([aad, iv, cipherText, al]);

        const hmac = createHmac(`sha${shaVersion}`, macKey);
        hmac.update(hmacInput);
        const expectedAuthenticationTag = hmac.digest();

        if (!expectedAuthenticationTag.subarray(0, expectedAuthenticationTag.length / 2).equals(authenticationTag)) {
            throw new Error('Invalid authentication tag');
        }

        const decipher = createDecipheriv(`aes-${aesVersion}-cbc`, encKey, iv);
        const plainText = Buffer.concat([decipher.update(cipherText), decipher.final()]);

        return plainText;
    }
}
