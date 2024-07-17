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

import { createPrivateKey, createPublicKey } from "node:crypto";

import { ECPublicKey, RSAPublicKey, ECPrivateKey, RSAPrivateKey, SymmetricKey, JWK } from "./jwk.js";
import { Payload } from "./jwt.js";
import JWTError from "../errors/JWTError.js";
import ECDSA from "./crypt/ecdsa.js";
import HMAC from "./crypt/hmac.js";
import RSA from "./crypt/rsa.js";
import RSAPSS from "./crypt/rsapss.js";

/**
 * JWS Algorithms
 */
export enum JWSAlgorithm {
    /** HMAC using SHA-256 */
    HS256 = 'HS256',
    /** HMAC using SHA-384 */
    HS384 = 'HS384',
    /** HMAC using SHA-512 */
    HS512 = 'HS512',

    /** RSASHA-PKCS1-v1_5 using SHA-256 */
    RS256 = 'RS256',
    /** RSASHA-PKCS1-v1_5 using SHA-384 */
    RS384 = 'RS384',
    /** RSASHA-PKCS1-v1_5 using SHA-512 */
    RS512 = 'RS512',

    /** ECDSA using P-256 and SHA-256 */
    ES256 = 'ES256',
    /** ECDSA using P-384 and SHA-384 */
    ES384 = 'ES384',
    /** ECDSA using P-521 and SHA-512 */
    ES512 = 'ES512',

    /** RSASSA-PSS using SHA-256 and MGF1 with SHA-256 */
    PS256 = 'PS256',
    /** RSASSA-PSS using SHA-384 and MGF1 with SHA-384 */
    PS384 = 'PS384',
    /** RSASSA-PSS using SHA-512 and MGF1 with SHA-512 */
    PS512 = 'PS512',

    /** No digital signature or MAC performed */
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
 *
 * @param payload JWT Payload
 * @param alg Algorithm
 * @param key Private Key (for RSA and ECDSA) or Secret (for HMAC)
 *
 * @returns Signed JWT in JWS Compact Serialization format
 */
export function signJWT(
    payload: Payload,
    alg: JWSAlgorithm,
    key: JWK,
): string {
    const header: Header = {
        alg: JWSAlgorithm[alg],
        typ: 'JWT'
    };

    const headerBase64  = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature     = sign(headerBase64, payloadBase64, alg, key);

    return `${headerBase64}.${payloadBase64}.${signature}`;
}

/**
 * Validate a signed JWT against provided secret or private key
 *
 * @param token JWT Token in JWS Compact Serialization format
 * @param alg Algorithm
 * @param key Private Key (for RSA and ECDSA) or Secret (for HMAC)
 *
 * @returns Whether the token is valid
 */
export function verifyJWS(
    token: string,
    alg: JWSAlgorithm,
    key: JWK,
): boolean {
    const [headerBase64, payloadBase64, signature] = token.split('.');

    const header: Header = JSON.parse(Buffer.from(headerBase64, 'base64url').toString('utf8'));

    if (typeof header !== 'object' || !header.alg) {
        return false;
    }

    const _alg = JWSAlgorithm[header.alg as keyof typeof JWSAlgorithm];
    if (_alg !== alg) {
        throw new JWTError(`Invalid alg: ${_alg}`);
    }

    return verify(headerBase64, payloadBase64, signature, alg, key);
}

/**
 * Sign a JWS Payload with the given algorithm and secret or private key
 *
 * @param header JWS Header
 * @param payload JWS Payload
 * @param alg Algorithm
 * @param key Private Key (for RSA and ECDSA) or Secret (for HMAC)
 *
 * @returns Signed JWS in JWS Compact Serialization format
 */
function sign(
    headerBase64: string,
    payloadBase64: string,
    alg: JWSAlgorithm,
    key: JWK,
): string {
    switch (alg) {
        case JWSAlgorithm.HS256:
            if (!(<SymmetricKey> key).k) {
                throw new JWTError('Missing secret');
            }

            return HMAC.sign(
                256,
                Buffer.from((<SymmetricKey> key).k!, 'base64url'),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.HS384:
            if (!(<SymmetricKey> key).k) {
                throw new JWTError('Missing secret');
            }

            return HMAC.sign(
                384,
                Buffer.from((<SymmetricKey> key).k!, 'base64url'),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.HS512:
            if (!(<SymmetricKey> key).k!) {
                throw new JWTError('Missing secret');
            }

            return HMAC.sign(
                512,
                Buffer.from((<SymmetricKey> key).k!, 'base64url'),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.RS256:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return RSA.sign(
                256,
                createPrivateKey({ key: <RSAPrivateKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.RS384:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return RSA.sign(
                384,
                createPrivateKey({ key: <RSAPrivateKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.RS512:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return RSA.sign(
                512,
                createPrivateKey({ key: <RSAPrivateKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.ES256:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return ECDSA.sign(
                256,
                createPrivateKey({ key: <ECPrivateKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.ES384:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return ECDSA.sign(
                384,
                createPrivateKey({ key: <ECPrivateKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.ES512:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return ECDSA.sign(
                512,
                createPrivateKey({ key: <ECPrivateKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.PS256:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return RSAPSS.sign(
                256,
                createPrivateKey({ key: <RSAPrivateKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.PS384:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return RSAPSS.sign(
                384,
                createPrivateKey({ key: <RSAPrivateKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');

        case JWSAlgorithm.PS512:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return RSAPSS.sign(
                512,
                createPrivateKey({ key: <RSAPrivateKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8')
            ).toString('base64url');
    }

    throw new JWTError(`Unsupported algorithm: ${alg}`);
}

/**
 * Verify a JWS Payload with the given algorithm and secret or public key
 *
 * @param headerBase64 JWS Header in Base64
 * @param payloadBase64 JWS Payload in Base64
 * @param signature JWS Signature
 * @param alg Algorithm
 * @param key Public Key (for RSA and ECDSA) or Secret (for HMAC)
 *
 * @returns Whether the JWS is valid
 */
function verify(
    headerBase64: string,
    payloadBase64: string,
    signature: string,
    alg: JWSAlgorithm,
    key: JWK,
): boolean {
    switch (alg) {
        case JWSAlgorithm.HS256:
            if (!(<SymmetricKey> key).k) {
                throw new JWTError('Missing secret');
            }

            return HMAC.verify(
                256,
                Buffer.from((<SymmetricKey> key).k!, 'base64url'),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.HS384:
            if (!(<SymmetricKey> key).k) {
                throw new JWTError('Missing secret');
            }

            return HMAC.verify(
                384,
                Buffer.from((<SymmetricKey> key).k!, 'base64url'),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.HS512:
            if (!(<SymmetricKey> key).k) {
                throw new JWTError('Missing secret');
            }

            return HMAC.verify(
                512,
                Buffer.from((<SymmetricKey> key).k!, 'base64url'),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.RS256:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return RSA.verify(
                256,
                createPublicKey({ key: <RSAPublicKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.RS384:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return RSA.verify(
                384,
                createPublicKey({ key: <RSAPublicKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.RS512:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return RSA.verify(
                512,
                createPublicKey({ key: <RSAPublicKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.ES256:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return ECDSA.verify(
                256,
                createPublicKey({ key: <ECPublicKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.ES384:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return ECDSA.verify(
                384,
                createPublicKey({ key: <ECPublicKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.ES512:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return ECDSA.verify(
                512,
                createPublicKey({ key: <ECPublicKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.PS256:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return RSAPSS.verify(
                256,
                createPublicKey({ key: <RSAPublicKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.PS384:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return RSAPSS.verify(
                384,
                createPublicKey({ key: <RSAPublicKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );

        case JWSAlgorithm.PS512:
            if (!key) {
                throw new JWTError('Missing private key');
            }

            return RSAPSS.verify(
                512,
                createPublicKey({ key: <RSAPublicKey> key, format: 'jwk' }),
                Buffer.from(headerBase64 + '.' + payloadBase64, 'utf8'),
                Buffer.from(signature, 'base64url')
            );
    }

    throw new JWTError(`Unsupported algorithm: ${alg}`);
}
