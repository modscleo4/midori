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

/**
 * JSON Web Key (JWK) Base Payload.
 */
export type BaseKey = {
    /** Key type */
    kty: string,

    /** Public Key use */
    use?: 'sig' | 'enc',

    /** Key Operations */
    key_ops?: ('sign' | 'verify' | 'encrypt' | 'decrypt' | 'wrapKey' | 'unwrapKey' | 'deriveKey' | 'deriveBits')[],

    /** Algorithm */
    alg?: string,

    /** Key ID */
    kid?: string,

    /** X.509 URL */
    x5u?: string,

    /** X.509 Certificate Chain */
    x5c?: string[],

    /** X.509 Certificate SHA-1 Thumbprint */
    x5t?: string,

    /** X.509 Certificate SHA-256 Thumbprint */
    'x5t#S256'?: string,
};

/**
 * Represents an Elliptic Curve Public Key.
 */
export type ECPublicKey = BaseKey & {
    kty: 'EC',

    /** Curve */
    crv: string,
    /** X Coordinate */
    x: string,
    /** Y Coordinate */
    y?: string,
};

/**
 * Represents an Elliptic Curve Private Key.
 */
export type ECPrivateKey = ECPublicKey & {
    /** ECC Private Key */
    d: string,
};

/**
 * Represents an RSA Public Key.
 */
export type RSAPublicKey = BaseKey & {
    kty: 'RSA',

    /** Modulus */
    n: string,
    /** Exponent */
    e: string,
};

/**
 * Represents an RSA Private Key.
 */
export type RSAPrivateKey = RSAPublicKey & {
    /** Private Exponent */
    d: string,
    /** First Prime Factor */
    p: string,
    /** Second Prime Factor */
    q: string,
    /** First Factor CRT Exponent */
    dp: string,
    /** Second Factor CRT Exponent */
    dq: string,
    /** First CRT Coefficient */
    qi: string,
    /** Other Primes Info */
    oth?: {
        /** Prime Factor */
        r: string,
        /** Factor CRT Exponent */
        d: string,
        /** Factor CRT Coefficient */
        t: string,
    }[],
};

/**
 * Represents a Symmetric Key.
 */
export type SymmetricKey = BaseKey & {
    kty: 'oct',

    /** Symmetric Key */
    k: string,
};

export type JWK = ECPublicKey | ECPrivateKey | RSAPublicKey | RSAPrivateKey | SymmetricKey;
