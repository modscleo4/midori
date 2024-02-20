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

import { describe, it } from 'node:test';
import { strictEqual } from 'node:assert';
import { createPrivateKey, createPublicKey, generateKeyPairSync, randomBytes } from 'node:crypto';

import { encryptJWT, decryptJWE, JWEAlgorithm, JWEEncryption, Header } from './jwe.js';
import { Payload as JWTPayload } from './jwt.js';

describe('JWE', () => {
    const payload: JWTPayload = {
        iss: 'www.example.com',
        aud: 'www.example.com',
        sub: 'joe',
        iat: 1300819380,
    };

    const { publicKey: RSAPublicKeyPEM, privateKey: RSAPrivateKeyPEM } = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
    const RSAPublicKey = createPublicKey(RSAPublicKeyPEM).export({ format: 'jwk' });
    const RSAPrivateKey = createPrivateKey(RSAPrivateKeyPEM).export({ format: 'jwk' });

    const AES128SymmetricKeyRaw = randomBytes(16);
    const AES128SymmetricKey = { kty: 'oct', k: AES128SymmetricKeyRaw.toString('base64url') };

    const AES192SymmetricKeyRaw = randomBytes(24);
    const AES192SymmetricKey = { kty: 'oct', k: AES192SymmetricKeyRaw.toString('base64url') };

    const AES256SymmetricKeyRaw = randomBytes(32);
    const AES256SymmetricKey = { kty: 'oct', k: AES256SymmetricKeyRaw.toString('base64url') };

    const DirectKeyRaw = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'utf8');
    const DirectKey = { kty: 'oct', k: DirectKeyRaw.toString('base64url') };

    const { publicKey: ECDSAPublicKeyPEM, privateKey: ECDSAPrivateKeyPEM } = generateKeyPairSync('ec', { namedCurve: 'P-256', publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'sec1', format: 'pem' } });
    const ECDSAPublicKey = createPublicKey(ECDSAPublicKeyPEM).export({ format: 'jwk' });
    const ECDSAPrivateKey = createPrivateKey(ECDSAPrivateKeyPEM).export({ format: 'jwk' });

    it('should encrypt a JWT using RSA-1_5 and A128CBC-HS256 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA1_5'], JWEEncryption["A128CBC-HS256"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A128CBC-HS256"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-1_5 and A192CBC-HS384 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA1_5'], JWEEncryption["A192CBC-HS384"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A192CBC-HS384"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-1_5 and A256CBC-HS512 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA1_5'], JWEEncryption["A256CBC-HS512"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A256CBC-HS512"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-1_5 and A128GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA1_5'], JWEEncryption["A128GCM"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A128GCM"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-1_5 and A192GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA1_5'], JWEEncryption["A192GCM"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A192GCM"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-1_5 and A256GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA1_5'], JWEEncryption["A256GCM"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A256GCM"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-OAEP and A128CBC-HS256 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP'], JWEEncryption["A128CBC-HS256"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A128CBC-HS256"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-OAEP and A192CBC-HS384 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP'], JWEEncryption["A192CBC-HS384"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A192CBC-HS384"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-OAEP and A256CBC-HS512 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP'], JWEEncryption["A256CBC-HS512"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A256CBC-HS512"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-OAEP and A128GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP'], JWEEncryption["A128GCM"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A128GCM"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-OAEP and A192GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP'], JWEEncryption["A192GCM"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A192GCM"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-OAEP and A256GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP'], JWEEncryption["A256GCM"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A256GCM"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-OAEP-256 and A128CBC-HS256 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A128CBC-HS256"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A128CBC-HS256"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-OAEP-256 and A192CBC-HS384 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A192CBC-HS384"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A192CBC-HS384"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-OAEP-256 and A256CBC-HS512 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A256CBC-HS512"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A256CBC-HS512"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-OAEP-256 and A128GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A128GCM"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A128GCM"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-OAEP-256 and A192GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A192GCM"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A192GCM"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using RSA-OAEP-256 and A256GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A256GCM"], RSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A256GCM"], RSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A128KW and A128CBC-HS256 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128KW'], JWEEncryption["A128CBC-HS256"], AES128SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A128CBC-HS256"], AES128SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A128KW and A192CBC-HS384 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128KW'], JWEEncryption["A192CBC-HS384"], AES128SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A192CBC-HS384"], AES128SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A128KW and A256CBC-HS512 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128KW'], JWEEncryption["A256CBC-HS512"], AES128SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A256CBC-HS512"], AES128SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A128KW and A128GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128KW'], JWEEncryption["A128GCM"], AES128SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A128GCM"], AES128SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A128KW and A192GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128KW'], JWEEncryption["A192GCM"], AES128SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A192GCM"], AES128SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A128KW and A256GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128KW'], JWEEncryption["A256GCM"], AES128SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A256GCM"], AES128SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A192KW and A128CBC-HS256 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192KW'], JWEEncryption["A128CBC-HS256"], AES192SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192KW'], JWEEncryption["A128CBC-HS256"], AES192SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A192KW and A192CBC-HS384 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192KW'], JWEEncryption["A192CBC-HS384"], AES192SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192KW'], JWEEncryption["A192CBC-HS384"], AES192SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A192KW and A256CBC-HS512 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192KW'], JWEEncryption["A256CBC-HS512"], AES192SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192KW'], JWEEncryption["A256CBC-HS512"], AES192SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A192KW and A128GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192KW'], JWEEncryption["A128GCM"], AES192SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192KW'], JWEEncryption["A128GCM"], AES192SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A192KW and A192GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192KW'], JWEEncryption["A192GCM"], AES192SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192KW'], JWEEncryption["A192GCM"], AES192SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A192KW and A256GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192KW'], JWEEncryption["A256GCM"], AES192SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192KW'], JWEEncryption["A256GCM"], AES192SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A256KW and A128CBC-HS256 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256KW'], JWEEncryption["A128CBC-HS256"], AES256SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256KW'], JWEEncryption["A128CBC-HS256"], AES256SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A256KW and A192CBC-HS384 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256KW'], JWEEncryption["A192CBC-HS384"], AES256SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256KW'], JWEEncryption["A192CBC-HS384"], AES256SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A256KW and A256CBC-HS512 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256KW'], JWEEncryption["A256CBC-HS512"], AES256SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256KW'], JWEEncryption["A256CBC-HS512"], AES256SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A256KW and A128GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256KW'], JWEEncryption["A128GCM"], AES256SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256KW'], JWEEncryption["A128GCM"], AES256SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A256KW and A192GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256KW'], JWEEncryption["A192GCM"], AES256SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256KW'], JWEEncryption["A192GCM"], AES256SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using A256KW and A256GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256KW'], JWEEncryption["A256GCM"], AES256SymmetricKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256KW'], JWEEncryption["A256GCM"], AES256SymmetricKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using dir and A128CBC-HS256 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['dir'], JWEEncryption["A128CBC-HS256"], DirectKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['dir'], JWEEncryption["A128CBC-HS256"], DirectKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using dir and A192CBC-HS384 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['dir'], JWEEncryption["A192CBC-HS384"], DirectKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['dir'], JWEEncryption["A192CBC-HS384"], DirectKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using dir and A256CBC-HS512 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['dir'], JWEEncryption["A256CBC-HS512"], DirectKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['dir'], JWEEncryption["A256CBC-HS512"], DirectKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using dir and A128GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['dir'], JWEEncryption["A128GCM"], DirectKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['dir'], JWEEncryption["A128GCM"], DirectKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using dir and A192GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['dir'], JWEEncryption["A192GCM"], DirectKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['dir'], JWEEncryption["A192GCM"], DirectKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using dir and A256GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['dir'], JWEEncryption["A256GCM"], DirectKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['dir'], JWEEncryption["A256GCM"], DirectKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES and A128CBC-HS256 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES'], JWEEncryption["A128CBC-HS256"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A128CBC-HS256"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES and A192CBC-HS384 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES'], JWEEncryption["A192CBC-HS384"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A192CBC-HS384"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES and A256CBC-HS512 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES'], JWEEncryption["A256CBC-HS512"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A256CBC-HS512"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES and A128GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES'], JWEEncryption["A128GCM"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A128GCM"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES and A192GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES'], JWEEncryption["A192GCM"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A192GCM"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES and A256GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES'], JWEEncryption["A256GCM"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A256GCM"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A128KW and A128CBC-HS256 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A128CBC-HS256"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A128CBC-HS256"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A128KW and A192CBC-HS384 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A192CBC-HS384"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A192CBC-HS384"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A128KW and A256CBC-HS512 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A256CBC-HS512"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A256CBC-HS512"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A128KW and A128GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A128GCM"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A128GCM"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A128KW and A192GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A192GCM"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A192GCM"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A128KW and A256GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A256GCM"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A256GCM"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A192KW and A128CBC-HS256 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A128CBC-HS256"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A128CBC-HS256"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A192KW and A192CBC-HS384 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A192CBC-HS384"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A192CBC-HS384"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A192KW and A256CBC-HS512 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A256CBC-HS512"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A256CBC-HS512"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A192KW and A128GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A128GCM"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A128GCM"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A192KW and A192GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A192GCM"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A192GCM"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A192KW and A256GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A256GCM"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A256GCM"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A256KW and A128CBC-HS256 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A128CBC-HS256"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A128CBC-HS256"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A256KW and A192CBC-HS384 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A192CBC-HS384"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A192CBC-HS384"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A256KW and A256CBC-HS512 and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A256CBC-HS512"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A256CBC-HS512"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A256KW and A128GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A128GCM"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A128GCM"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A256KW and A192GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A192GCM"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A192GCM"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });

    it('should encrypt a JWT using ECDH-ES+A256KW and A256GCM and decrypt it', () => {
        const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A256GCM"], ECDSAPublicKey);
        strictEqual(typeof jwe, 'string');

        const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A256GCM"], ECDSAPrivateKey);
        strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
    });
});
