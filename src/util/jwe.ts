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

import { constants, createPrivateKey, createPublicKey, privateDecrypt, publicEncrypt, randomBytes } from "node:crypto";
import JWTError from "../errors/JWTError.js";

import AESGCM from "./crypt/aesgcm.js";
import AESHMAC from "./crypt/aeshmac.js";

/**
 * JWE Algorithms
 */
export enum JWEAlgorithm {
    RSA1_5 = 'RSA1_5',
    "RSA-OAEP" = 'RSA-OAEP',
    "RSA-OAEP-256" = 'RSA-OAEP-256',

    A128KW = 'A128KW',
    A192KW = 'A192KW',
    A256KW = 'A256KW',

    dir = 'dir',

    "ECDH-ES" = 'ECDH-ES',
    "ECDH-ES+A128KW" = 'ECDH-ES+A128KW',
    "ECDH-ES+A192KW" = 'ECDH-ES+A192KW',
    "ECDH-ES+A256KW" = 'ECDH-ES+A256KW',

    A128GCMKW = 'A128GCMKW',
    A192GCMKW = 'A192GCMKW',
    A256GCMKW = 'A256GCMKW',

    "PBES2-HS256+A128KW" = 'PBES2-HS256+A128KW',
    "PBES2-HS384+A192KW" = 'PBES2-HS384+A192KW',
    "PBES2-HS512+A256KW" = 'PBES2-HS512+A256KW',
};

export enum JWEEncryption {
    "A128CBC-HS256" = 'A128CBC-HS256',
    "A192CBC-HS384" = 'A192CBC-HS384',
    "A256CBC-HS512" = 'A256CBC-HS512',

    A128GCM = 'A128GCM',
    A192GCM = 'A192GCM',
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
};

export function encryptJWT(
    plainText: Buffer,
    cty: string,
    alg: JWEAlgorithm,
    enc: JWEEncryption,
    secretOrPrivateKey: string,
): string {
    const cek = randomBytes(cekLength(enc) / 8);
    const encryptedKey = encryptCEK(cek, alg, secretOrPrivateKey);
    const iv = randomBytes(ivLength(enc) / 8);
    const header: Header = {
        alg,
        enc,
        typ: 'JWT',
        cty,
    };

    const protectedHeaderBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encryptedKeyBase64 = Buffer.from(encryptedKey).toString('base64url');
    const ivBase64 = iv.toString('base64url');
    const aad = Buffer.from(protectedHeaderBase64, 'ascii');

    const { cipherText, authenticationTag } = encrypt(plainText, cek, iv, aad, enc);

    const cipherTextBase64 = cipherText.toString('base64url');
    const authenticationTagBase64 = authenticationTag.toString('base64url');

    return `${protectedHeaderBase64}.${encryptedKeyBase64}.${ivBase64}.${cipherTextBase64}.${authenticationTagBase64}`;
}

export function decryptJWE(
    token: string,
    alg: JWEAlgorithm,
    enc: JWEEncryption,
    secretOrPrivateKey: string,
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

    const encryptedKey = Buffer.from(encryptedKeyBase64, 'base64url');
    const cek = decryptCEK(encryptedKey, alg, secretOrPrivateKey);
    const iv = Buffer.from(ivBase64, 'base64url');
    const aad = Buffer.from(protectedHeaderBase64, 'ascii');
    const authenticationTag = Buffer.from(authenticationTagBase64, 'base64url');
    const cipherText = Buffer.from(cipherTextBase64, 'base64url');

    return decrypt(cipherText, cek, iv, aad, authenticationTag, enc);
}

function cekLength(enc: JWEEncryption): number {
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
}

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
}

function encryptCEK(cek: Buffer, alg: JWEAlgorithm, secretOrPrivateKey: string): Buffer {
    switch (alg) {
        case JWEAlgorithm.RSA1_5:
            return publicEncrypt(
                {
                    key: secretOrPrivateKey,
                    padding: constants.RSA_PKCS1_PADDING,
                },
                cek,
            )

        case JWEAlgorithm["RSA-OAEP"]:
            return publicEncrypt(
                {
                    key: createPublicKey(createPrivateKey(secretOrPrivateKey)),
                    padding: constants.RSA_PKCS1_OAEP_PADDING,
                },
                cek
            );

        case JWEAlgorithm["RSA-OAEP-256"]:
            return publicEncrypt(
                {
                    key: createPublicKey(createPrivateKey(secretOrPrivateKey)),
                    padding: constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256',
                },
                cek
            );
    }

    throw new JWTError(`Unsupported algorithm: ${alg}`);
}

function decryptCEK(encryptedKey: Buffer, alg: JWEAlgorithm, secretOrPrivateKey: string): Buffer {
    switch (alg) {
        case JWEAlgorithm.RSA1_5:
            return privateDecrypt(
                {
                    key: secretOrPrivateKey,
                    padding: constants.RSA_PKCS1_PADDING,
                },
                encryptedKey,
            );

        case JWEAlgorithm["RSA-OAEP"]:
            return privateDecrypt(
                {
                    key: createPrivateKey(secretOrPrivateKey),
                    padding: constants.RSA_PKCS1_OAEP_PADDING,
                },
                encryptedKey
            );

        case JWEAlgorithm["RSA-OAEP-256"]:
            return privateDecrypt(
                {
                    key: createPrivateKey(secretOrPrivateKey),
                    padding: constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256',
                },
                encryptedKey
            );
    }

    throw new JWTError(`Unsupported algorithm: ${alg}`);
}

function encrypt(plainText: Buffer, cek: Buffer, iv: Buffer, aad: Buffer, enc: JWEEncryption): { cipherText: Buffer; authenticationTag: Buffer; } {
    switch (enc) {
        case JWEEncryption.A128GCM:
            return AESGCM.encrypt(128, cek, iv, aad, plainText);

        case JWEEncryption.A192GCM:
            return AESGCM.encrypt(192, cek, iv, aad, plainText);

        case JWEEncryption.A256GCM:
            return AESGCM.encrypt(256, cek, iv, aad, plainText);

        case JWEEncryption["A128CBC-HS256"]:
            return AESHMAC.encrypt(128, 256, cek, iv, aad, plainText);

        case JWEEncryption["A192CBC-HS384"]:
            return AESHMAC.encrypt(192, 384, cek, iv, aad, plainText);

        case JWEEncryption["A256CBC-HS512"]:
            return AESHMAC.encrypt(256, 512, cek, iv, aad, plainText);
    }

    throw new JWTError(`Unsupported encryption: ${enc}`);
}

function decrypt(cipherText: Buffer, cek: Buffer, iv: Buffer, aad: Buffer, authenticationTag: Buffer, enc: JWEEncryption): Buffer {
    switch (enc) {
        case JWEEncryption.A128GCM:
            return AESGCM.decrypt(128, cek, iv, aad, cipherText, authenticationTag);

        case JWEEncryption.A192GCM:
            return AESGCM.decrypt(192, cek, iv, aad, cipherText, authenticationTag);

        case JWEEncryption.A256GCM:
            return AESGCM.decrypt(256, cek, iv, aad, cipherText, authenticationTag);

        case JWEEncryption["A128CBC-HS256"]:
            return AESHMAC.decrypt(128, 256, cek, iv, aad, cipherText, authenticationTag);

        case JWEEncryption["A192CBC-HS384"]:
            return AESHMAC.decrypt(192, 384, cek, iv, aad, cipherText, authenticationTag);

        case JWEEncryption["A256CBC-HS512"]:
            return AESHMAC.decrypt(256, 512, cek, iv, aad, cipherText, authenticationTag);
    }

    throw new JWTError(`Unsupported encryption: ${enc}`);
}
