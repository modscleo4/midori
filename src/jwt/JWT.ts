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

import { readFileSync } from "node:fs";

import { Payload } from "../util/jwt.js";
import { signJWT, verifyJWS, JWSAlgorithm } from "../util/jws.js";
import { decryptJWE, encryptJWT, JWEAlgorithm, JWEEncryption } from "../util/jwe.js";

/**
 * JWT (JSON Web Token) Service.
 */
export default class JWT {
    #sign?: {
        alg: JWSAlgorithm;
        secretOrPrivateKey: string;
    };
    #encrypt?: {
        alg: JWEAlgorithm;
        enc: JWEEncryption;
        secretOrPrivateKey: string;
    };

    constructor(sign?: { alg: string; secret: string; privateKeyFile?: string; }, encrypt?: { alg: string; enc: string; secret?: string; privateKeyFile: string; }) {
        if (sign) {
            const alg = JWSAlgorithm[sign.alg as keyof typeof JWSAlgorithm];
            const secret = sign.secret || null;
            const privateKey = sign.privateKeyFile ? readFileSync(sign.privateKeyFile, { encoding: 'utf8' }) : null;

            if (![JWSAlgorithm.HS256, JWSAlgorithm.HS384, JWSAlgorithm.HS512].includes(alg) && !privateKey) {
                throw new Error('Private key is required for this algorithm');
            }

            if ([JWSAlgorithm.HS256, JWSAlgorithm.HS384, JWSAlgorithm.HS512].includes(alg) && !secret) {
                throw new Error('Secret is required for this algorithm');
            }

            this.#sign = {
                alg,
                secretOrPrivateKey: ([JWSAlgorithm.HS256, JWSAlgorithm.HS384, JWSAlgorithm.HS512].includes(alg) ? secret : privateKey)!,
            };
        }

        if (encrypt) {
            const alg = JWEAlgorithm[encrypt.alg as keyof typeof JWEAlgorithm];
            const enc = JWEEncryption[encrypt.enc as keyof typeof JWEEncryption];
            const secret = encrypt.secret || null;
            const privateKey = encrypt.privateKeyFile ? readFileSync(encrypt.privateKeyFile, { encoding: 'utf8' }) : undefined;

            if ([JWEAlgorithm.RSA1_5, JWEAlgorithm['RSA-OAEP'], JWEAlgorithm['RSA-OAEP-256'], JWEAlgorithm['ECDH-ES'], JWEAlgorithm['ECDH-ES+A128KW'], JWEAlgorithm['ECDH-ES+A192KW'], JWEAlgorithm['ECDH-ES+A256KW']].includes(alg) && !privateKey) {
                throw new Error('Private key is required for this algorithm');
            }

            if ([JWEAlgorithm.A128KW, JWEAlgorithm.A192KW, JWEAlgorithm.A256KW, JWEAlgorithm.dir].includes(alg) && !secret) {
                throw new Error('Secret is required for this algorithm');
            }

            this.#encrypt = {
                alg,
                enc,
                secretOrPrivateKey: ([JWEAlgorithm.A128KW, JWEAlgorithm.A192KW, JWEAlgorithm.A256KW, JWEAlgorithm.dir].includes(alg) ? secret : privateKey)!,
            };
        }
    }

    sign(payload: Payload): string {
        if (!this.#sign) {
            throw new Error('Sign is not configured');
        }

        return signJWT(payload, this.#sign.alg, this.#sign.secretOrPrivateKey);
    }

    verify(token: string): boolean {
        if (!this.#sign) {
            throw new Error('Sign is not configured');
        }

        try {
            return verifyJWS(token, this.#sign.alg, this.#sign.secretOrPrivateKey);
        } catch (e) {
            return false;
        }
    }

    encrypt(plainText: Buffer, contentType: string): string {
        if (!this.#encrypt) {
            throw new Error('Encrypt is not configured');
        }

        return encryptJWT(plainText, contentType, this.#encrypt.alg, this.#encrypt.enc, this.#encrypt.secretOrPrivateKey);
    }

    decrypt(token: string): Buffer | null {
        if (!this.#encrypt) {
            throw new Error('Encrypt is not configured');
        }

        try {
            return decryptJWE(token, this.#encrypt.alg, this.#encrypt.enc, this.#encrypt.secretOrPrivateKey);
        } catch (e) {
            return null;
        }
    }
}
