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

import { ecPrivateKeyToRaw, ecPublicKeyToRaw } from "../asn1.js";
import type { ECPublicKey, ECPrivateKey } from "../jwk.js";

/**
 * Elliptic Curve Diffie-Hellman, as used by JWE.
 */
export default class ECDH {
    /**
     * Generates an ephemeral private key for the given curve.
     *
     * @param crv The curve to use
     *
     * @returns The generated private key
     */
    static generateEphemeralKey(crv: string): ECPrivateKey {
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

        return createPrivateKey(privateKey).export({ format: 'jwk' }) as ECPrivateKey;
    }

    /**
     * Derives a shared secret from a private and a public key. Uses the crypto API.
     *
     * @param privateKey The private key
     * @param publicKey The public key
     *
     * @returns The shared secret
     */
    static deriveSharedSecret(privateKey: ECPrivateKey, publicKey: ECPublicKey): Buffer {
        const privKey = createPrivateKey({ format: 'jwk', key: privateKey });
        const pubKey  = createPublicKey({ format: 'jwk', key: publicKey });

        const ecdh = createECDH(ECDH.getCurveName(privateKey.crv));
        ecdh.setPrivateKey(ecPrivateKeyToRaw(privKey));

        return ecdh.computeSecret(ecPublicKeyToRaw(pubKey));
    }

    /**
     * Returns the OpenSSL curve name for the given curve.
     *
     * @param crv The curve name
     *
     * @returns The OpenSSL curve name
     */
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
