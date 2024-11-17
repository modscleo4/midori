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

import { createSign, createVerify, type KeyObject, constants } from "node:crypto";

/**
 * Rivest–Shamir–Adleman + Probabilistic Signature Scheme, as used by JWS.
 */
export default class RSAPSS {
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
        const sign = createSign('RSA-SHA' + shaVersion);
        sign.update(data);
        return sign.sign({
            key: privateKey,
            padding: constants.RSA_PKCS1_PSS_PADDING,
            saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
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
        const verify = createVerify('RSA-SHA' + shaVersion);
        verify.update(data);
        return verify.verify( {
            key: publicKey,
            padding: constants.RSA_PKCS1_PSS_PADDING,
            saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
        }, signature);
    }
}
