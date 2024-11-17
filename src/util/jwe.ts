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

import { constants, createPrivateKey, createPublicKey, privateDecrypt, publicEncrypt, randomBytes, pbkdf2Sync } from "node:crypto";

import type { ECPublicKey, RSAPublicKey, SymmetricKey, JWK, ECPrivateKey } from "./jwk.js";
import { encodeBufferWithLength, encodeUInt32BE } from "./buffer.js";
import JWTError from "../errors/JWTError.js";
import AESGCM from "./crypt/aesgcm.js";
import AESHMAC from "./crypt/aeshmac.js";
import AESKW from "./crypt/aeskw.js";
import ConcatKDF from "./crypt/concatkdf.js";
import ECDH from "./crypt/ecdh.js";
import DeflateRaw from "./compression/deflateRaw.js";

/**
 * JWE Algorithms
 */
export enum JWEAlgorithm {
    /** RSAES-PKCS1-v1_5 @deprecated CVE-2023-46809 */
    RSA1_5 = 'RSA1_5',
    /** RSAES OAEP */
    "RSA-OAEP" = 'RSA-OAEP',
    /** RSAES OAEP using SHA-256 and MGF1 with SHA-256 */
    "RSA-OAEP-256" = 'RSA-OAEP-256',

    /** AES Key Wrap with default initial value using 128-bit key */
    A128KW = 'A128KW',
    /** AES Key Wrap with default initial value using 192-bit key */
    A192KW = 'A192KW',
    /** AES Key Wrap with default initial value using 256-bit key */
    A256KW = 'A256KW',

    /** Direct use of a shared symmetric key as the CEK */
    dir = 'dir',

    /** Elliptic Curve Diffie-Hellman Ephemeral Static key agreement using Concat KDF */
    "ECDH-ES" = 'ECDH-ES',
    /** ECDH-ES using Concat KDF and CEK wrapped with "A128KW" */
    "ECDH-ES+A128KW" = 'ECDH-ES+A128KW',
    /** ECDH-ES using Concat KDF and CEK wrapped with "A192KW" */
    "ECDH-ES+A192KW" = 'ECDH-ES+A192KW',
    /** ECDH-ES using Concat KDF and CEK wrapped with "A256KW" */
    "ECDH-ES+A256KW" = 'ECDH-ES+A256KW',

    /** Key wrapping with AES GCM using 128-bit key */
    A128GCMKW = 'A128GCMKW',
    /** Key wrapping with AES GCM using 192-bit key */
    A192GCMKW = 'A192GCMKW',
    /** Key wrapping with AES GCM using 256-bit key */
    A256GCMKW = 'A256GCMKW',

    /** PBES2 with HMAC SHA-256 and "A128KW" wrapping */
    "PBES2-HS256+A128KW" = 'PBES2-HS256+A128KW',
    /** PBES2 with HMAC SHA-384 and "A192KW" wrapping */
    "PBES2-HS384+A192KW" = 'PBES2-HS384+A192KW',
    /** PBES2 with HMAC SHA-512 and "A256KW" wrapping */
    "PBES2-HS512+A256KW" = 'PBES2-HS512+A256KW',
};

/**
 * JWE Encryption Algorithms
 */
export enum JWEEncryption {
    /** AES_128_CBC_HMAC_SHA_256 authenticated encryption algorithm */
    "A128CBC-HS256" = 'A128CBC-HS256',
    /** AES_192_CBC_HMAC_SHA_384 authenticated encryption algorithm */
    "A192CBC-HS384" = 'A192CBC-HS384',
    /** AES_256_CBC_HMAC_SHA_512 authenticated encryption algorithm */
    "A256CBC-HS512" = 'A256CBC-HS512',

    /** AES GCM using 128-bit key */
    A128GCM = 'A128GCM',
    /** AES GCM using 192-bit key */
    A192GCM = 'A192GCM',
    /** AES GCM using 256-bit key */
    A256GCM = 'A256GCM',
};

/**
 * JWE Header
 */
export type Header = {
    /** Algorithm */
    alg: keyof typeof JWEAlgorithm,

    /** Encryption */
    enc: keyof typeof JWEEncryption,

    /** Type */
    typ: 'JWT',

    /** Content Type */
    cty: string,

    /** Compression */
    zip?: 'DEF',

    /** Ephemeral Public Key */
    epk?: ECPublicKey,

    /** Agreement PartyUInfo */
    apu?: string,

    /** Agreement PartyVInfo */
    apv?: string,

    /** Initialization Vector */
    iv?: string,

    /** Authentication Tag */
    tag?: string,

    /** PBES2 Salt Input */
    p2s?: string,

    /** PBES2 Count */
    p2c?: number,
};

/**
 * Encrypts a token using JWE Compact Serialization
 *
 * @param plainText Content to be encrypted
 * @param cty Content-Type of plainText
 * @param alg Algorithm
 * @param enc Encryption algorithm
 * @param key Public key (for asymmetric algorithms) or shared secret (for symmetric algorithms)
 * @param extraParams Additional header parameters (apu, apv, zip...)
 * @returns Encrypted token serialized in JWE Compact Serialization
 */
export function encryptJWT(
    plainText: Buffer,
    cty: string,
    alg: JWEAlgorithm,
    enc: JWEEncryption,
    key: JWK,
    extraParams?: Partial<Header>,
): string {
    const ephemeralKey = generateEphemeralKey(alg, <ECPublicKey> key);
    const header: Header = {
        alg,
        enc,
        typ: 'JWT',
        cty,
        ...generateHeaderParams(alg, enc, ephemeralKey),
        ...(extraParams ?? {}),
    };
    const [cek, altKey]  = generateCEK(alg, enc, header, key, ephemeralKey);
    const encryptedKey   = encryptCEK(cek, alg, altKey ?? key, header);
    const iv             = randomBytes(ivLength(enc) / 8);

    const protectedHeaderBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encryptedKeyBase64    = Buffer.from(encryptedKey).toString('base64url');
    const ivBase64              = iv.toString('base64url');
    const aad                   = Buffer.from(protectedHeaderBase64, 'ascii');

    if (header.zip === 'DEF') {
        plainText = DeflateRaw.compressSync(plainText);
    }

    const { cipherText, authenticationTag } = encrypt(plainText, cek, iv, aad, enc);

    const cipherTextBase64        = cipherText.toString('base64url');
    const authenticationTagBase64 = authenticationTag.toString('base64url');

    return `${protectedHeaderBase64}.${encryptedKeyBase64}.${ivBase64}.${cipherTextBase64}.${authenticationTagBase64}`;
}

/**
 * Decrypts a token using JWE Compact Serialization
 *
 * @param token Encrypted token serialized in JWE Compact Serialization
 * @param alg Algorithm
 * @param enc Encryption algorithm
 * @param key Private key (for asymmetric algorithms) or shared secret (for symmetric algorithms)
 * @returns Decrypted content (plainText parameter from encryptJWT)
 */
export function decryptJWE(
    token: string,
    alg: JWEAlgorithm,
    enc: JWEEncryption,
    key: JWK,
): Buffer {
    const [protectedHeaderBase64, encryptedKeyBase64, ivBase64, cipherTextBase64, authenticationTagBase64] = token.split('.', 5);
    const protectedHeader: Header = JSON.parse(Buffer.from(protectedHeaderBase64, 'base64url').toString('utf8'));

    const _alg = JWEAlgorithm[protectedHeader.alg as keyof typeof JWEAlgorithm];
    const _enc = JWEEncryption[protectedHeader.enc as keyof typeof JWEEncryption];

    if (_alg !== alg) {
        throw new JWTError(`Invalid alg: ${_alg}`);
    }

    if (_enc !== enc) {
        throw new JWTError(`Invalid enc: ${_enc}`);
    }

    const [, altKey]        = generateCEK(alg, enc, protectedHeader, key, protectedHeader.epk ?? null);
    const encryptedKey      = Buffer.from(encryptedKeyBase64, 'base64url');
    const cek               = decryptCEK(encryptedKey, alg, enc, altKey ?? key, protectedHeader);
    const iv                = Buffer.from(ivBase64, 'base64url');
    const aad               = Buffer.from(protectedHeaderBase64, 'ascii');
    const authenticationTag = Buffer.from(authenticationTagBase64, 'base64url');
    const cipherText        = Buffer.from(cipherTextBase64, 'base64url');

    const plainText = decrypt(cipherText, cek, iv, aad, authenticationTag, enc);

    if (protectedHeader.zip === 'DEF') {
        return DeflateRaw.decompressSync(plainText);
    }

    return plainText;
}

/**
 * Calculates the length of the CEK based on the encryption algorithm
 *
 * @param enc Encryption algorithm
 *
 * @returns Length of the CEK in bits
 */
export function cekLength(enc: JWEEncryption): number {
    switch (enc) {
        case JWEEncryption.A128GCM:
            return 128;
        case JWEEncryption.A192GCM:
            return 192;
        case JWEEncryption.A256GCM:
            return 256;

        case JWEEncryption["A128CBC-HS256"]:
            return 256;
        case JWEEncryption["A192CBC-HS384"]:
            return 384;
        case JWEEncryption["A256CBC-HS512"]:
            return 512;
    }

    throw new JWTError(`Unsupported encryption: ${enc}`);
}

/**
 * Generates the Content Encryption Key (CEK) based on the algorithm and encryption algorithm
 *
 * @param alg Algorithm
 * @param enc Encryption algorithm
 * @param header Header
 * @param key Public key (for asymmetric algorithms) or shared secret (for symmetric algorithms)
 * @param ephemeralKey Ephemeral key (null to generate a new one)
 * @returns CEK and the key to be used for encryption (null if the CEK is used directly)
*/
//function generateCEK(alg: JWEAlgorithm, enc: JWEEncryption, header: Header, key: JWKPayload): [Buffer, JWKPayload];
function generateCEK(alg: JWEAlgorithm, enc: JWEEncryption, header: Header, key: JWK, ephemeralKey: ECPublicKey | ECPrivateKey | null): [Buffer, JWK | null] {
    if (alg === JWEAlgorithm.dir) {
        // Direct encryption uses the key as the CEK (trim the key to the appropriate length)
        return [deserializeSymmetricKey(<SymmetricKey> key).subarray(0, cekLength(enc) / 8), null];
    }

    if (alg === JWEAlgorithm["ECDH-ES"] || alg === JWEAlgorithm["ECDH-ES+A128KW"] || alg === JWEAlgorithm["ECDH-ES+A192KW"] || alg === JWEAlgorithm["ECDH-ES+A256KW"]) {
        const keyLengthBits = alg === JWEAlgorithm["ECDH-ES"] ? cekLength(enc) :
            alg === JWEAlgorithm["ECDH-ES+A128KW"] ? 128 :
            alg === JWEAlgorithm["ECDH-ES+A192KW"] ? 192 :
            256;

        // AlgorithmID should be the encryption algorithm if ECDH-ES is used, otherwise it should be the key agreement algorithm
        const AlgorithmID = encodeBufferWithLength(Buffer.from(alg === JWEAlgorithm["ECDH-ES"] ? enc : alg, 'utf8'));
        const PartyUInfo = encodeBufferWithLength(Buffer.from(header.apu || '', 'base64url'));
        const PartyVInfo = encodeBufferWithLength(Buffer.from(header.apv || '', 'base64url'));
        const SuppPubInfo = encodeUInt32BE(keyLengthBits);
        const SuppPrivInfo = Buffer.from('', 'utf8');
        const otherInfo = Buffer.concat([AlgorithmID, PartyUInfo, PartyVInfo, SuppPubInfo, SuppPrivInfo]);

        // Derive the shared secret from the ephemeral key and the recipient's key (use the appropriate private and public key)
        const sharedSecret = ECDH.deriveSharedSecret(<ECPrivateKey> ((<ECPrivateKey> ephemeralKey!).d ? ephemeralKey! : key), <ECPrivateKey> ((<ECPrivateKey> ephemeralKey!).d ? key! : ephemeralKey!));

        // ECDH-ES uses the shared secret as the CEK
        // ECDH-ES+A128KW, ECDH-ES+A192KW and ECDH-ES+A256KW use the shared secret to derive the CEK
        const derivedKey = ConcatKDF.deriveKey(256, sharedSecret, keyLengthBits, otherInfo);

        if (alg === JWEAlgorithm["ECDH-ES"]) {
            return [derivedKey, null];
        }

        return [randomBytes(cekLength(enc) / 8), <SymmetricKey> {
            kty: 'oct',
            k: derivedKey.toString('base64url'),
        }];
    }

    return [randomBytes(cekLength(enc) / 8), null];
}

/**
 * Calculates the length of the IV (Initialization Vector) based on the encryption algorithm
 *
 * @param enc Encryption algorithm
 *
 * @returns Length of the IV in bits
 */
function ivLength(enc: JWEEncryption): number {
    switch (enc) {
        case JWEEncryption.A128GCM:
        case JWEEncryption.A192GCM:
        case JWEEncryption.A256GCM:
            return 96;
        case JWEEncryption["A128CBC-HS256"]:
        case JWEEncryption["A192CBC-HS384"]:
        case JWEEncryption["A256CBC-HS512"]:
            return 128;
    }

    throw new JWTError(`Unsupported encryption: ${enc}`);
}

/**
 * Generates an ephemeral key for ECDH-ES algorithms
 *
 * @param alg Algorithm
 * @param key Public key (for asymmetric algorithms) or shared secret (for symmetric algorithms)
 *
 * @returns Ephemeral key (null if the algorithm does not require it)
 */
function generateEphemeralKey(alg: JWEAlgorithm, key: ECPublicKey): ECPrivateKey | null {
    if (alg === JWEAlgorithm["ECDH-ES"] || alg === JWEAlgorithm["ECDH-ES+A128KW"] || alg === JWEAlgorithm["ECDH-ES+A192KW"] || alg === JWEAlgorithm["ECDH-ES+A256KW"]) {
        return ECDH.generateEphemeralKey(key.crv);
    }

    return null;
}

/**
 * Generates additional parameters for the header based on the algorithm
 *
 * @param alg Algorithm
 * @param enc Encryption algorithm
 * @param ephemeralKey Ephemeral key (null if the algorithm does not require it)
 *
 * @returns Additional parameters for the header (epk, iv, tag, p2s, p2c...)
 */
function generateHeaderParams(alg: JWEAlgorithm, enc: JWEEncryption, ephemeralKey: ECPublicKey | null): Partial<Header> {
    switch (alg) {
        case JWEAlgorithm['ECDH-ES']:
        case JWEAlgorithm["ECDH-ES+A128KW"]:
        case JWEAlgorithm["ECDH-ES+A192KW"]:
        case JWEAlgorithm["ECDH-ES+A256KW"]:
            if (ephemeralKey === null) {
                return {};
            }

            return {
                epk: {
                    kty: 'EC',
                    crv: ephemeralKey.crv,
                    x: ephemeralKey.x,
                    y: ephemeralKey.y,
                },
            };

        case JWEAlgorithm.A128GCMKW:
        case JWEAlgorithm.A192GCMKW:
        case JWEAlgorithm.A256GCMKW:
            return {
                iv: randomBytes(96 / 8).toString('base64url'),
                tag: '', // This will be generated later
            };

        case JWEAlgorithm["PBES2-HS256+A128KW"]:
        case JWEAlgorithm["PBES2-HS384+A192KW"]:
        case JWEAlgorithm["PBES2-HS512+A256KW"]:
            return {
                p2s: randomBytes(16).toString('base64url'),
                p2c: 4096,
            };
    }

    return {};
}

/**
 * Get the raw key from a SymmetricKey
 *
 * @param key Symmetric Key
 *
 * @returns Raw key bytes
 */
function deserializeSymmetricKey(key: SymmetricKey): Buffer {
    return Buffer.from(key.k!, 'base64url');
}

/**
 * Encrypts the CEK using the provided algorithm and key
 *
 * @param cek Content Encryption Key
 * @param alg Algorithm
 * @param key Public key (for asymmetric algorithms) or shared secret (for symmetric algorithms)
 * @param header Header (used to retrieve the IV and store the authentication tag for GCM algorithms)
 *
 * @returns Encrypted CEK
 */
function encryptCEK(cek: Buffer, alg: JWEAlgorithm, key: JWK, header: Header): Buffer {
    switch (alg) {
        case JWEAlgorithm.RSA1_5:
            return publicEncrypt(
                {
                    key: createPublicKey({ key: <RSAPublicKey> key, format: 'jwk' }),
                    padding: constants.RSA_PKCS1_PADDING,
                },
                cek,
            );

        case JWEAlgorithm["RSA-OAEP"]:
            return publicEncrypt(
                {
                    key: createPublicKey({ key: <RSAPublicKey> key, format: 'jwk' }),
                    padding: constants.RSA_PKCS1_OAEP_PADDING,
                },
                cek
            );

        case JWEAlgorithm["RSA-OAEP-256"]:
            return publicEncrypt(
                {
                    key: createPublicKey({ key: <RSAPublicKey> key, format: 'jwk' }),
                    padding: constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256',
                },
                cek
            );

        case JWEAlgorithm.A128KW:
            return AESKW.encrypt(128, cek, deserializeSymmetricKey(<SymmetricKey> key));

        case JWEAlgorithm.A192KW:
            return AESKW.encrypt(192, cek, deserializeSymmetricKey(<SymmetricKey> key));

        case JWEAlgorithm.A256KW:
            return AESKW.encrypt(256, cek, deserializeSymmetricKey(<SymmetricKey> key));

        case JWEAlgorithm.dir:
            return Buffer.alloc(0);

        case JWEAlgorithm["ECDH-ES"]:
            return Buffer.alloc(0);

        case JWEAlgorithm["ECDH-ES+A128KW"]:
            return AESKW.encrypt(128, cek, deserializeSymmetricKey(<SymmetricKey> key));

        case JWEAlgorithm["ECDH-ES+A192KW"]:
            return AESKW.encrypt(192, cek, deserializeSymmetricKey(<SymmetricKey> key));

        case JWEAlgorithm["ECDH-ES+A256KW"]:
            return AESKW.encrypt(256, cek, deserializeSymmetricKey(<SymmetricKey> key));

        case JWEAlgorithm.A128GCMKW: {
            const { cipherText, authenticationTag } = AESGCM.encrypt(128, deserializeSymmetricKey(<SymmetricKey> key), Buffer.from(header.iv!, 'base64url'), Buffer.alloc(0), cek, 16);
            header.tag = authenticationTag.toString('base64url');
            return cipherText;
        }

        case JWEAlgorithm.A192GCMKW: {
            const { cipherText, authenticationTag } = AESGCM.encrypt(192, deserializeSymmetricKey(<SymmetricKey> key), Buffer.from(header.iv!, 'base64url'), Buffer.alloc(0), cek, 16);
            header.tag = authenticationTag.toString('base64url');
            return cipherText;
        }

        case JWEAlgorithm.A256GCMKW: {
            const { cipherText, authenticationTag } = AESGCM.encrypt(256, deserializeSymmetricKey(<SymmetricKey> key), Buffer.from(header.iv!, 'base64url'), Buffer.alloc(0), cek, 16);
            header.tag = authenticationTag.toString('base64url');
            return cipherText;
        }

        case JWEAlgorithm["PBES2-HS256+A128KW"]:
            return AESKW.encrypt(128, cek, pbkdf2Sync(deserializeSymmetricKey(<SymmetricKey> key), Buffer.concat([Buffer.from('PBES2-HS256+A128KW', 'utf8'), Buffer.from([0]), Buffer.from(header.p2s!, 'base64url')]), header.p2c!, 16, 'sha256'));

        case JWEAlgorithm["PBES2-HS384+A192KW"]:
            return AESKW.encrypt(192, cek, pbkdf2Sync(deserializeSymmetricKey(<SymmetricKey> key), Buffer.concat([Buffer.from('PBES2-HS384+A192KW', 'utf8'), Buffer.from([0]), Buffer.from(header.p2s!, 'base64url')]), header.p2c!, 24, 'sha384'));

        case JWEAlgorithm["PBES2-HS512+A256KW"]:
            return AESKW.encrypt(256, cek, pbkdf2Sync(deserializeSymmetricKey(<SymmetricKey> key), Buffer.concat([Buffer.from('PBES2-HS512+A256KW', 'utf8'), Buffer.from([0]), Buffer.from(header.p2s!, 'base64url')]), header.p2c!, 32, 'sha512'));
    }

    throw new JWTError(`Unsupported algorithm: ${alg}`);
}

/**
 * Decrypts the CEK using the provided algorithm and key
 *
 * @param encryptedKey Encrypted CEK
 * @param alg Algorithm
 * @param enc Encryption algorithm
 * @param key Private key (for asymmetric algorithms) or shared secret (for symmetric algorithms)
 * @param header Header (used to retrieve the IV and authentication tag for GCM algorithms and the ephemeral key for ECDH-ES algorithm)
 *
 * @returns Decrypted CEK
 */
function decryptCEK(encryptedKey: Buffer, alg: JWEAlgorithm, enc: JWEEncryption, key: JWK, header: Header): Buffer {
    switch (alg) {
        case JWEAlgorithm.RSA1_5:
            return privateDecrypt(
                {
                    key: createPrivateKey({ key: <RSAPublicKey> key, format: 'jwk' }),
                    padding: constants.RSA_PKCS1_PADDING,
                },
                encryptedKey,
            );

        case JWEAlgorithm["RSA-OAEP"]:
            return privateDecrypt(
                {
                    key: createPrivateKey({ key: <RSAPublicKey> key, format: 'jwk' }),
                    padding: constants.RSA_PKCS1_OAEP_PADDING,
                },
                encryptedKey
            );

        case JWEAlgorithm["RSA-OAEP-256"]:
            return privateDecrypt(
                {
                    key: createPrivateKey({ key: <RSAPublicKey> key, format: 'jwk' }),
                    padding: constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256',
                },
                encryptedKey
            );

        case JWEAlgorithm.A128KW:
            return AESKW.decrypt(128, encryptedKey, deserializeSymmetricKey(<SymmetricKey> key));

        case JWEAlgorithm.A192KW:
            return AESKW.decrypt(192, encryptedKey, deserializeSymmetricKey(<SymmetricKey> key));

        case JWEAlgorithm.A256KW:
            return AESKW.decrypt(256, encryptedKey, deserializeSymmetricKey(<SymmetricKey> key));

        case JWEAlgorithm.dir:
            // Direct encryption uses the key as the CEK (trim the key to the appropriate length)
            return deserializeSymmetricKey(<SymmetricKey> key).subarray(0, cekLength(enc) / 8);

        case JWEAlgorithm["ECDH-ES"]:
            // Ephemeral key is used to derive the CEK
            return generateCEK(alg, enc, header, key, header.epk ?? null)[0];

        case JWEAlgorithm["ECDH-ES+A128KW"]:
            return AESKW.decrypt(128, encryptedKey, deserializeSymmetricKey(<SymmetricKey> key));

        case JWEAlgorithm["ECDH-ES+A192KW"]:
            return AESKW.decrypt(192, encryptedKey, deserializeSymmetricKey(<SymmetricKey> key));

        case JWEAlgorithm["ECDH-ES+A256KW"]:
            return AESKW.decrypt(256, encryptedKey, deserializeSymmetricKey(<SymmetricKey> key));

        case JWEAlgorithm.A128GCMKW:
            if (!header.tag || !header.iv) {
                throw new JWTError('Invalid header');
            }

            return AESGCM.decrypt(128, deserializeSymmetricKey(<SymmetricKey> key), Buffer.from(header.iv!, 'base64url'), Buffer.alloc(0), encryptedKey, Buffer.from(header.tag!, 'base64url'), 16);

        case JWEAlgorithm.A192GCMKW:
            if (!header.tag || !header.iv) {
                throw new JWTError('Invalid header');
            }

            return AESGCM.decrypt(192, deserializeSymmetricKey(<SymmetricKey> key), Buffer.from(header.iv!, 'base64url'), Buffer.alloc(0), encryptedKey, Buffer.from(header.tag!, 'base64url'), 16);

        case JWEAlgorithm.A256GCMKW:
            if (!header.tag || !header.iv) {
                throw new JWTError('Invalid header');
            }

            return AESGCM.decrypt(256, deserializeSymmetricKey(<SymmetricKey> key), Buffer.from(header.iv!, 'base64url'), Buffer.alloc(0), encryptedKey, Buffer.from(header.tag!, 'base64url'), 16);

        case JWEAlgorithm["PBES2-HS256+A128KW"]:
            return AESKW.decrypt(128, encryptedKey, pbkdf2Sync(deserializeSymmetricKey(<SymmetricKey> key), Buffer.concat([Buffer.from('PBES2-HS256+A128KW', 'utf8'), Buffer.from([0]), Buffer.from(header.p2s!, 'base64url')]), header.p2c!, 16, 'sha256'));

        case JWEAlgorithm["PBES2-HS384+A192KW"]:
            return AESKW.decrypt(192, encryptedKey, pbkdf2Sync(deserializeSymmetricKey(<SymmetricKey> key), Buffer.concat([Buffer.from('PBES2-HS384+A192KW', 'utf8'), Buffer.from([0]), Buffer.from(header.p2s!, 'base64url')]), header.p2c!, 24, 'sha384'));

        case JWEAlgorithm["PBES2-HS512+A256KW"]:
            return AESKW.decrypt(256, encryptedKey, pbkdf2Sync(deserializeSymmetricKey(<SymmetricKey> key), Buffer.concat([Buffer.from('PBES2-HS512+A256KW', 'utf8'), Buffer.from([0]), Buffer.from(header.p2s!, 'base64url')]), header.p2c!, 32, 'sha512'));
    }

    throw new JWTError(`Unsupported algorithm: ${alg}`);
}

/**
 * Encrypts the plain text using the provided algorithm and key
 *
 * @param plainText Plain text to be encrypted
 * @param cek Content Encryption Key
 * @param iv Initialization Vector
 * @param aad Additional Authenticated Data
 * @param enc Encryption algorithm
 *
 * @returns Encrypted cipher text and authentication tag
 */
function encrypt(plainText: Buffer, cek: Buffer, iv: Buffer, aad: Buffer, enc: JWEEncryption): { cipherText: Buffer; authenticationTag: Buffer; } {
    switch (enc) {
        case JWEEncryption.A128GCM:
            return AESGCM.encrypt(128, cek, iv, aad, plainText, 16);

        case JWEEncryption.A192GCM:
            return AESGCM.encrypt(192, cek, iv, aad, plainText, 16);

        case JWEEncryption.A256GCM:
            return AESGCM.encrypt(256, cek, iv, aad, plainText, 16);

        case JWEEncryption["A128CBC-HS256"]:
            return AESHMAC.encrypt(128, 256, cek, iv, aad, plainText);

        case JWEEncryption["A192CBC-HS384"]:
            return AESHMAC.encrypt(192, 384, cek, iv, aad, plainText);

        case JWEEncryption["A256CBC-HS512"]:
            return AESHMAC.encrypt(256, 512, cek, iv, aad, plainText);
    }

    throw new JWTError(`Unsupported encryption: ${enc}`);
}

/**
 * Decrypts the cipher text using the provided algorithm and key
 *
 * @param cipherText Cipher text to be decrypted
 * @param cek Content Encryption Key
 * @param iv Initialization Vector
 * @param aad Additional Authenticated Data
 * @param authenticationTag Authentication Tag
 * @param enc Encryption algorithm
 *
 * @returns Decrypted plain text
 */
function decrypt(cipherText: Buffer, cek: Buffer, iv: Buffer, aad: Buffer, authenticationTag: Buffer, enc: JWEEncryption): Buffer {
    switch (enc) {
        case JWEEncryption.A128GCM:
            return AESGCM.decrypt(128, cek, iv, aad, cipherText, authenticationTag, 16);

        case JWEEncryption.A192GCM:
            return AESGCM.decrypt(192, cek, iv, aad, cipherText, authenticationTag, 16);

        case JWEEncryption.A256GCM:
            return AESGCM.decrypt(256, cek, iv, aad, cipherText, authenticationTag, 16);

        case JWEEncryption["A128CBC-HS256"]:
            return AESHMAC.decrypt(128, 256, cek, iv, aad, cipherText, authenticationTag);

        case JWEEncryption["A192CBC-HS384"]:
            return AESHMAC.decrypt(192, 384, cek, iv, aad, cipherText, authenticationTag);

        case JWEEncryption["A256CBC-HS512"]:
            return AESHMAC.decrypt(256, 512, cek, iv, aad, cipherText, authenticationTag);
    }

    throw new JWTError(`Unsupported encryption: ${enc}`);
}
