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

import { CipherKey, createCipheriv, createDecipheriv } from 'crypto';

/**
 * Advanced Encryption Standard Key Wrap (AESKW) algorithm, as used in JWE.
 */
export default class AESKW {
    static encrypt(aesVersion: 128 | 192 | 256, cek: Buffer, key: CipherKey, iv: Buffer): Buffer {
        const cipher = createCipheriv(`id-aes${aesVersion}-wrap`, key, iv);
        const encrypted = cipher.update(cek);
        cipher.final();

        return encrypted;
    }

    static decrypt(aesVersion: 128 | 192 | 256, encrypted: Buffer, key: CipherKey, iv: Buffer): Buffer {
        const decipher = createDecipheriv(`id-aes${aesVersion}-wrap`, key, iv);
        const decrypted = decipher.update(encrypted);
        decipher.final();

        return decrypted;
    }
}
