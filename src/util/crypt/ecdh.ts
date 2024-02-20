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

import { createECDH, createPrivateKey, createPublicKey, generateKeyPairSync } from "node:crypto";

import { privateKeyToRaw, publicKeyToRaw } from "../asn1.js";
import { PayloadEC } from "../jwk.js";

/**
 * Elliptic Curve Diffie-Hellman, as used by JWE.
 */
export default class ECDH {
    static generateEphemeralKey(crv: string): PayloadEC {
        const { publicKey, privateKey } = generateKeyPairSync('ec', {
            publicKeyEncoding: {
                format: 'pem',
                type: 'spki'
            },
            privateKeyEncoding: {
                format: 'pem',
                type: 'pkcs8',
            },
            namedCurve: crv,
        });

        return createPrivateKey(privateKey).export({ format: 'jwk' }) as PayloadEC;
    }

    /**
     * Derives a shared secret from a private and a public key. Uses the crypto.subtle API.
     */
    static deriveSharedSecret(privateKey: PayloadEC, publicKey: PayloadEC): Buffer {
        const privKey = createPrivateKey({ format: 'jwk', key: privateKey });
        const pubKey  = createPublicKey({ format: 'jwk', key: publicKey });

        const ecdh = createECDH(ECDH.getCurveName(privateKey.crv!));
        ecdh.setPrivateKey(privateKeyToRaw(privKey));

        return ecdh.computeSecret(publicKeyToRaw(pubKey));
    }

    static getCurveName(crv: string): string {
        switch (crv) {
            case 'P-256':
                return 'prime256v1';
            case 'P-384':
                return 'secp384r1';
            case 'P-521':
                return 'secp521r1';
            case 'secp256k1':
                return 'secp256k1';
        }

        throw new Error('Unsupported curve');
    }
}
