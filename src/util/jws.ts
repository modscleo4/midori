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

import { createPrivateKey } from "node:crypto";

import { Payload } from "./jwt.js";
import ECDSA from "./crypt/ecdsa.js";
import HMAC from "./crypt/hmac.js";
import RSA from "./crypt/rsa.js";
import RSAPSS from "./crypt/rsapss.js";
import JWTError from "../errors/JWTError.js";

/**
 * JWS Algorithms
 */
export enum JWSAlgorithm {
    HS256 = 'HS256',
    HS384 = 'HS384',
    HS512 = 'HS512',

    RS256 = 'RS256',
    RS384 = 'RS384',
    RS512 = 'RS512',

    ES256 = 'ES256',
    ES384 = 'ES384',
    ES512 = 'ES512',

    PS256 = 'PS256',
    PS384 = 'PS384',
    PS512 = 'PS512',

    none = 'none',
};

/**
 * JWS Header
 */
export type Header = {
    /** Algorithm */
    alg: keyof typeof JWSAlgorithm,

    /** Type */
    typ: 'JWT',
};

/**
 * Sign a JWT Payload with the given algorithm and secret or private key
 */
export function signJWT(
    payload: Payload,
    alg: JWSAlgorithm,
    secretOrPrivateKey: string,
): string {
    const header: Header = {
        alg: JWSAlgorithm[alg],
        typ: 'JWT'
    };

    const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = sign(headerBase64, payloadBase64, alg, secretOrPrivateKey);

    return `${headerBase64}.${payloadBase64}.${signature}`;
}

/**
 * Validate a signed JWT against provided secret or private key
 */
export function verifyJWS(
    token: string,
    alg: JWSAlgorithm,
    secretOrPrivateKey: string,
): boolean {
    const [headerBase64, payloadBase64, signature] = token.split('.');

    const header: Header = JSON.parse(Buffer.from(headerBase64, 'base64url').toString('utf8'));

    if (typeof header !== 'object' || header.alg) {
        return false;
    }

    const _alg = JWSAlgorithm[header.alg as keyof typeof JWSAlgorithm];
    if (_alg !== alg) {
        throw new JWTError(`Invalid alg: ${_alg}`);
    }

    return verify(headerBase64, payloadBase64, signature, alg, secretOrPrivateKey);
}

function sign(
    headerBase64: string,
    payloadBase64: string,
    alg: JWSAlgorithm,
    secretOrPrivateKey: string
): string {
    switch (alg) {
        case JWSAlgorithm.HS256:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing secret');
            }

            return HMAC.sign(
                256,
                secretOrPrivateKey,
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.HS384:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing secret');
            }

            return HMAC.sign(
                384,
                secretOrPrivateKey,
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.HS512:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing secret');
            }

            return HMAC.sign(
                512,
                secretOrPrivateKey,
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.RS256:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return RSA.sign(
                256,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.RS384:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return RSA.sign(
                384,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.RS512:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return RSA.sign(
                512,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.ES256:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return ECDSA.sign(
                256,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.ES384:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return ECDSA.sign(
                384,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.ES512:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return ECDSA.sign(
                512,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.PS256:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return RSAPSS.sign(
                256,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.PS384:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return RSAPSS.sign(
                384,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.PS512:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return RSAPSS.sign(
                512,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');
    }

    throw new JWTError(`Unsupported algorithm: ${alg}`);
}


function verify(
    headerBase64: string,
    payloadBase64: string,
    signature: string,
    alg: JWSAlgorithm,
    secretOrPrivateKey: string
): boolean {
    switch (alg) {
        case JWSAlgorithm.HS256:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing secret');
            }

            return HMAC.verify(
                256,
                secretOrPrivateKey,
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.HS384:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing secret');
            }

            return HMAC.verify(
                384,
                secretOrPrivateKey,
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.HS512:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing secret');
            }

            return HMAC.verify(
                512,
                secretOrPrivateKey,
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.RS256:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return RSA.verify(
                256,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.RS384:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return RSA.verify(
                384,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.RS512:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return RSA.verify(
                512,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.ES256:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return ECDSA.verify(
                256,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.ES384:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return ECDSA.verify(
                384,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.ES512:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return ECDSA.verify(
                512,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.PS256:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return RSAPSS.verify(
                256,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.PS384:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return RSAPSS.verify(
                384,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.PS512:
            if (!secretOrPrivateKey) {
                throw new JWTError('Missing private key');
            }

            return RSAPSS.verify(
                512,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );
    }

    throw new JWTError(`Unsupported algorithm: ${alg}`);
}
