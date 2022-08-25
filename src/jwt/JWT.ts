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

import { readFileSync } from "fs";
import { generateJWT, validateJWT, JWTAlgorithm, Payload } from "../util/jwt.js";

/**
 * JWT (JSON Web Token) Service Provider.
 */
export default class JWT {
    #alg: JWTAlgorithm;
    #secretOrPrivateKey: string = 'secret';

    constructor(_alg: string, _secret: string, publicKeyFile?: string, privateKeyFile?: string) {
        const alg = JWTAlgorithm[_alg as keyof typeof JWTAlgorithm];
        const secret = _secret || 'secret';
        const publicKey = publicKeyFile ? readFileSync(publicKeyFile, { encoding: 'utf8' }) : undefined;
        const privateKey = privateKeyFile ? readFileSync(privateKeyFile, { encoding: 'utf8' }) : undefined;

        this.#alg = alg;
        this.#secretOrPrivateKey = ([JWTAlgorithm.HS256, JWTAlgorithm.HS384, JWTAlgorithm.HS512].includes(alg) ? secret : privateKey) || 'secret';
    }

    sign(payload: Payload): string {
        return generateJWT(payload, this.#alg, this.#secretOrPrivateKey);
    }

    verify(token: string): boolean {
        return validateJWT(token, this.#secretOrPrivateKey);
    }
}
