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

import { createCipheriv, createDecipheriv } from "node:crypto";

/**
 * Advanced Encryption Standard (Galois/Counter Mode), as used by JWE.
 */
export default class AESGCM {
    static encrypt(aesVersion: 128 | 192 | 256, cek: Buffer, iv: Buffer, aad: Buffer, plainText: Buffer): { cipherText: Buffer; authenticationTag: Buffer; } {
        const cipher = createCipheriv(`aes-${aesVersion}-gcm`, cek, iv, { authTagLength: 16 });
        cipher.setAAD(aad);
        const cipherText = cipher.update(plainText);
        cipher.final(); // GCM mode is a counter mode, so no output here
        const authenticationTag = cipher.getAuthTag();

        return { cipherText, authenticationTag };
    }

    static decrypt(aesVersion: 128 | 192 | 256, cek: Buffer, iv: Buffer, aad: Buffer, cipherText: Buffer, authenticationTag: Buffer): Buffer {
        const decipher = createDecipheriv(`aes-${aesVersion}-gcm`, cek, iv, { authTagLength: 16 });
        decipher.setAAD(aad);
        decipher.setAuthTag(authenticationTag);
        const plainText = decipher.update(cipherText);
        decipher.final();

        return plainText;
    }
}
