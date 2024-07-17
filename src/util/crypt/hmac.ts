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

import { createHmac } from "node:crypto";

/**
 * Hash-based Message Authentication Code, as used by JWS.
 */
export default class HMAC {
    /**
     * Signs a message using the given secret.
     *
     * @param shaVersion The SHA version to use (256, 384 or 512)
     * @param secret The secret
     * @param data The data to be signed
     *
     * @returns The signature
     */
    static sign(shaVersion: 256 | 384 | 512, secret: Buffer, data: Buffer): Buffer {
        const hmac = createHmac('sha' + shaVersion, secret);
        hmac.update(data);
        const signature = hmac.digest();

        return signature;
    }

    /**
     * Verifies a signature using the given secret.
     *
     * @param shaVersion The SHA version to use (256, 384 or 512)
     * @param secret The secret
     * @param data The data to be verified
     * @param signature The signature to be verified
     *
     * @returns Whether the signature is valid
     */
    static verify(shaVersion: 256 | 384 | 512, secret: Buffer, data: Buffer, signature: Buffer): boolean {
        const hmac = createHmac('sha' + shaVersion, secret);
        hmac.update(data);
        const calculatedSignature = hmac.digest();

        return calculatedSignature.equals(signature);
    }
}
