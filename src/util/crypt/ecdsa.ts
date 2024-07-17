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

import { createSign, createVerify, KeyObject } from "node:crypto";

/**
 * Elliptic Curve Digital Signature Algorithm, as used by JWS.
 */
export default class ECDSA {
    /**
     * Signs a message using the given private key.
     *
     * @param shaVersion The SHA version to use (256, 384 or 512)
     * @param privateKey The private key
     * @param data The data to be signed
     *
     * @returns The signature
     */
    static sign(shaVersion: 256 | 384 | 512, privateKey: KeyObject, data: Buffer): Buffer {
        const sign = createSign('SHA' + shaVersion);
        sign.update(data);
        return sign.sign({
            key: privateKey,
            dsaEncoding: "ieee-p1363"
        });
    }

    /**
     * Verifies a signature using the given public key.
     *
     * @param shaVersion The SHA version to use (256, 384 or 512)
     * @param publicKey The public key
     * @param data The data to be verified
     * @param signature The signature to be verified
     *
     * @returns Whether the signature is valid
     */
    static verify(shaVersion: 256 | 384 | 512, publicKey: KeyObject, data: Buffer, signature: Buffer): boolean {
        const verify = createVerify('SHA' + shaVersion);
        verify.update(data);
        return verify.verify({
            key: publicKey,
            dsaEncoding: "ieee-p1363"
        }, signature);
    }
}
