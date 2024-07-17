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
    /**
     * Encrypt a plaintext using AES-GCM.
     *
     * @param aesVersion The AES version to use (128, 192 or 256)
     * @param cek The Content Encryption Key
     * @param iv The Initialization Vector
     * @param aad The Additional Authenticated Data
     * @param plainText The plaintext to be encrypted
     * @param authTagLength The length of the authentication tag
     *
     * @returns The ciphertext and the authentication tag
     */
    static encrypt(aesVersion: 128 | 192 | 256, cek: Buffer, iv: Buffer, aad: Buffer, plainText: Buffer, authTagLength: number): { cipherText: Buffer; authenticationTag: Buffer; } {
        const cipher = createCipheriv(`aes-${aesVersion}-gcm`, cek, iv, { authTagLength });
        cipher.setAAD(aad);
        const cipherText = cipher.update(plainText);
        cipher.final(); // GCM mode is a counter mode, so no output here
        const authenticationTag = cipher.getAuthTag();

        return { cipherText, authenticationTag };
    }

    /**
     * Decrypt a ciphertext using AES-GCM.
     *
     * @param aesVersion The AES version to use (128, 192 or 256)
     * @param cek The Content Encryption Key
     * @param iv The Initialization Vector
     * @param aad The Additional Authenticated Data
     * @param cipherText The ciphertext to be decrypted
     * @param authenticationTag The authentication tag
     * @param authTagLength The length of the authentication tag
     *
     * @returns The plain text
     */
    static decrypt(aesVersion: 128 | 192 | 256, cek: Buffer, iv: Buffer, aad: Buffer, cipherText: Buffer, authenticationTag: Buffer, authTagLength: number): Buffer {
        const decipher = createDecipheriv(`aes-${aesVersion}-gcm`, cek, iv, { authTagLength });
        decipher.setAAD(aad);
        decipher.setAuthTag(authenticationTag);
        const plainText = decipher.update(cipherText);
        decipher.final();

        return plainText;
    }
}
