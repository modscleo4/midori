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

import { createPrivateKey } from 'crypto';
import ECDSA from './crypt/ecdsa.js';
import HMAC from './crypt/hmac.js';
import RSA from './crypt/rsa.js';
import RSAPSS from './crypt/rsapss.js';

/**
 * JWT Algorithms
 */
export enum JWTAlgorithm {
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
 * JWT Header
 */
export type Header = {
    /** Algorithm */
    alg: keyof typeof JWTAlgorithm,

    /** Type */
    typ: 'JWT' | 'JWE',
};

/**
 * JWT Payload
 */
export type Payload = {
    /** Issuer */
    iss?: string,

    /** Subject */
    sub?: string,

    /** Audience */
    aud?: string,

    /** Expiration time */
    exp?: number,

    /** Not before */
    nbf?: number,

    /** Issued at */
    iat?: number,

    /** JWT ID */
    jti?: string,
};

/**
 * Sign a JWT Payload with the given algorithm and secret or private key
 */
export function generateJWT(
    payload: Payload,
    alg: JWTAlgorithm,
    secretOrPrivateKey: string,
): string {
    const header: Header = {
        alg: JWTAlgorithm[alg],
        typ: 'JWT'
    };

    const headerBase64 = Buffer.from(JSON.stringify(header)).toString("base64url");
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = signJWT(headerBase64, payloadBase64, alg, secretOrPrivateKey);

    return `${headerBase64}.${payloadBase64}.${signature}`;
}

/**
 * Validate a signed JWT against provided secret or private key
 */
export function validateJWT(
    token: string,
    secretOrPrivateKey: string,
): boolean {
    const [headerBase64, payloadBase64, signature] = token.split('.');

    const header: Header = JSON.parse(Buffer.from(headerBase64, 'base64url').toString('utf8'));

    if (!(
        typeof header === 'object'
        && header.alg
    )) {
        return false;
    }

    const alg = JWTAlgorithm[header.alg as keyof typeof JWTAlgorithm];
    if (!alg) {
        return false;
    }

    return verifyJWT(headerBase64, payloadBase64, signature, alg, secretOrPrivateKey);
}

function signJWT(
    headerBase64: string,
    payloadBase64: string,
    alg: JWTAlgorithm,
    secretOrPrivateKey: string
): string {
    switch (alg) {
        case JWTAlgorithm.HS256:
            if (!secretOrPrivateKey) {
                throw new Error('Missing secret');
            }

            return HMAC.sign(
                256,
                secretOrPrivateKey,
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWTAlgorithm.HS384:
            if (!secretOrPrivateKey) {
                throw new Error('Missing secret');
            }

            return HMAC.sign(
                384,
                secretOrPrivateKey,
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWTAlgorithm.HS512:
            if (!secretOrPrivateKey) {
                throw new Error('Missing secret');
            }

            return HMAC.sign(
                512,
                secretOrPrivateKey,
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWTAlgorithm.RS256:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return RSA.sign(
                256,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWTAlgorithm.RS384:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return RSA.sign(
                384,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWTAlgorithm.RS512:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return RSA.sign(
                512,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWTAlgorithm.ES256:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return ECDSA.sign(
                256,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWTAlgorithm.ES384:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return ECDSA.sign(
                384,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWTAlgorithm.ES512:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return ECDSA.sign(
                512,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWTAlgorithm.PS256:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return RSAPSS.sign(
                256,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWTAlgorithm.PS384:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return RSAPSS.sign(
                384,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWTAlgorithm.PS512:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return RSAPSS.sign(
                512,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');
    }

    throw new Error(`Unsupported algorithm: ${alg}`);
}


function verifyJWT(
    headerBase64: string,
    payloadBase64: string,
    signature: string,
    alg: JWTAlgorithm,
    secretOrPrivateKey: string
): boolean {
    switch (alg) {
        case JWTAlgorithm.HS256:
            if (!secretOrPrivateKey) {
                throw new Error('Missing secret');
            }

            return HMAC.verify(
                256,
                secretOrPrivateKey,
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWTAlgorithm.HS384:
            if (!secretOrPrivateKey) {
                throw new Error('Missing secret');
            }

            return HMAC.verify(
                384,
                secretOrPrivateKey,
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWTAlgorithm.HS512:
            if (!secretOrPrivateKey) {
                throw new Error('Missing secret');
            }

            return HMAC.verify(
                512,
                secretOrPrivateKey,
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWTAlgorithm.RS256:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return RSA.verify(
                256,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWTAlgorithm.RS384:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return RSA.verify(
                384,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWTAlgorithm.RS512:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return RSA.verify(
                512,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWTAlgorithm.ES256:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return ECDSA.verify(
                256,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWTAlgorithm.ES384:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return ECDSA.verify(
                384,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWTAlgorithm.ES512:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return ECDSA.verify(
                512,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWTAlgorithm.PS256:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return RSAPSS.verify(
                256,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWTAlgorithm.PS384:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return RSAPSS.verify(
                384,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWTAlgorithm.PS512:
            if (!secretOrPrivateKey) {
                throw new Error('Missing private key');
            }

            return RSAPSS.verify(
                512,
                createPrivateKey(secretOrPrivateKey),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );
    }

    throw new Error(`Unsupported algorithm: ${alg}`);
}
