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
import { ok, strictEqual } from 'node:assert';
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, randomBytes } from 'node:crypto';

import { encryptJWT, decryptJWE, JWEAlgorithm, JWEEncryption, Header } from './jwe.js';
import type { Payload as JWTPayload } from './jwt.js';
import type { SymmetricKey, ECPublicKey, ECPrivateKey, RSAPublicKey, RSAPrivateKey } from './jwk.js';

await describe('JWE', async () => {
    await describe('Decrypt after encrypt', async () => {
        const payload: JWTPayload = {
            iss: 'www.example.com',
            aud: 'www.example.com',
            sub: 'joe',
            iat: 1300819380,
        };

        const { publicKey: RSAPublicKeyPEM, privateKey: RSAPrivateKeyPEM } = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
        const RSAPublicKey = createPublicKey(RSAPublicKeyPEM).export({ format: 'jwk' }) as RSAPublicKey;
        const RSAPrivateKey = createPrivateKey(RSAPrivateKeyPEM).export({ format: 'jwk' }) as RSAPrivateKey;

        const AES128SymmetricKeyRaw = randomBytes(16);
        const AES128SymmetricKey: SymmetricKey = { kty: 'oct', k: AES128SymmetricKeyRaw.toString('base64url') };

        const AES192SymmetricKeyRaw = randomBytes(24);
        const AES192SymmetricKey: SymmetricKey = { kty: 'oct', k: AES192SymmetricKeyRaw.toString('base64url') };

        const AES256SymmetricKeyRaw = randomBytes(32);
        const AES256SymmetricKey: SymmetricKey = { kty: 'oct', k: AES256SymmetricKeyRaw.toString('base64url') };

        const DirectKeyRaw = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'utf8');
        const DirectKey: SymmetricKey = { kty: 'oct', k: DirectKeyRaw.toString('base64url') };

        const PBES2SymmetricKeyRaw = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'utf8');
        const PBES2SymmetricKey: SymmetricKey = { kty: 'oct', k: PBES2SymmetricKeyRaw.toString('base64url') };

        const { publicKey: ECDSAPublicKeyPEM, privateKey: ECDSAPrivateKeyPEM } = generateKeyPairSync('ec', { namedCurve: 'P-256', publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'sec1', format: 'pem' } });
        const ECDSAPublicKey = createPublicKey(ECDSAPublicKeyPEM).export({ format: 'jwk' }) as ECPublicKey;
        const ECDSAPrivateKey = createPrivateKey(ECDSAPrivateKeyPEM).export({ format: 'jwk' }) as ECPrivateKey;

        await it('should encrypt a JWT using RSA-1_5 and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA1_5'], JWEEncryption["A128CBC-HS256"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A128CBC-HS256"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-1_5 and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA1_5'], JWEEncryption["A192CBC-HS384"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A192CBC-HS384"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-1_5 and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA1_5'], JWEEncryption["A256CBC-HS512"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A256CBC-HS512"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-1_5 and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA1_5'], JWEEncryption["A128GCM"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A128GCM"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-1_5 and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA1_5'], JWEEncryption["A192GCM"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A192GCM"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-1_5 and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA1_5'], JWEEncryption["A256GCM"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A256GCM"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-OAEP and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP'], JWEEncryption["A128CBC-HS256"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A128CBC-HS256"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-OAEP and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP'], JWEEncryption["A192CBC-HS384"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A192CBC-HS384"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-OAEP and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP'], JWEEncryption["A256CBC-HS512"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A256CBC-HS512"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-OAEP and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP'], JWEEncryption["A128GCM"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A128GCM"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-OAEP and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP'], JWEEncryption["A192GCM"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A192GCM"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-OAEP and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP'], JWEEncryption["A256GCM"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A256GCM"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-OAEP-256 and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A128CBC-HS256"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A128CBC-HS256"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-OAEP-256 and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A192CBC-HS384"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A192CBC-HS384"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-OAEP-256 and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A256CBC-HS512"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A256CBC-HS512"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-OAEP-256 and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A128GCM"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A128GCM"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-OAEP-256 and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A192GCM"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A192GCM"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using RSA-OAEP-256 and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A256GCM"], RSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP-256'], JWEEncryption["A256GCM"], RSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A128KW and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128KW'], JWEEncryption["A128CBC-HS256"], AES128SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A128CBC-HS256"], AES128SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A128KW and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128KW'], JWEEncryption["A192CBC-HS384"], AES128SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A192CBC-HS384"], AES128SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A128KW and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128KW'], JWEEncryption["A256CBC-HS512"], AES128SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A256CBC-HS512"], AES128SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A128KW and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128KW'], JWEEncryption["A128GCM"], AES128SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A128GCM"], AES128SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A128KW and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128KW'], JWEEncryption["A192GCM"], AES128SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A192GCM"], AES128SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A128KW and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128KW'], JWEEncryption["A256GCM"], AES128SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A256GCM"], AES128SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A192KW and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192KW'], JWEEncryption["A128CBC-HS256"], AES192SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192KW'], JWEEncryption["A128CBC-HS256"], AES192SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A192KW and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192KW'], JWEEncryption["A192CBC-HS384"], AES192SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192KW'], JWEEncryption["A192CBC-HS384"], AES192SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A192KW and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192KW'], JWEEncryption["A256CBC-HS512"], AES192SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192KW'], JWEEncryption["A256CBC-HS512"], AES192SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A192KW and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192KW'], JWEEncryption["A128GCM"], AES192SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192KW'], JWEEncryption["A128GCM"], AES192SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A192KW and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192KW'], JWEEncryption["A192GCM"], AES192SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192KW'], JWEEncryption["A192GCM"], AES192SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A192KW and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192KW'], JWEEncryption["A256GCM"], AES192SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192KW'], JWEEncryption["A256GCM"], AES192SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A256KW and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256KW'], JWEEncryption["A128CBC-HS256"], AES256SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256KW'], JWEEncryption["A128CBC-HS256"], AES256SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A256KW and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256KW'], JWEEncryption["A192CBC-HS384"], AES256SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256KW'], JWEEncryption["A192CBC-HS384"], AES256SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A256KW and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256KW'], JWEEncryption["A256CBC-HS512"], AES256SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256KW'], JWEEncryption["A256CBC-HS512"], AES256SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A256KW and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256KW'], JWEEncryption["A128GCM"], AES256SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256KW'], JWEEncryption["A128GCM"], AES256SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A256KW and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256KW'], JWEEncryption["A192GCM"], AES256SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256KW'], JWEEncryption["A192GCM"], AES256SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A256KW and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256KW'], JWEEncryption["A256GCM"], AES256SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256KW'], JWEEncryption["A256GCM"], AES256SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using dir and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['dir'], JWEEncryption["A128CBC-HS256"], DirectKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['dir'], JWEEncryption["A128CBC-HS256"], DirectKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using dir and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['dir'], JWEEncryption["A192CBC-HS384"], DirectKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['dir'], JWEEncryption["A192CBC-HS384"], DirectKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using dir and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['dir'], JWEEncryption["A256CBC-HS512"], DirectKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['dir'], JWEEncryption["A256CBC-HS512"], DirectKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using dir and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['dir'], JWEEncryption["A128GCM"], DirectKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['dir'], JWEEncryption["A128GCM"], DirectKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using dir and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['dir'], JWEEncryption["A192GCM"], DirectKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['dir'], JWEEncryption["A192GCM"], DirectKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using dir and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['dir'], JWEEncryption["A256GCM"], DirectKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['dir'], JWEEncryption["A256GCM"], DirectKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES'], JWEEncryption["A128CBC-HS256"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A128CBC-HS256"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES'], JWEEncryption["A192CBC-HS384"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A192CBC-HS384"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES'], JWEEncryption["A256CBC-HS512"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A256CBC-HS512"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES'], JWEEncryption["A128GCM"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A128GCM"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES'], JWEEncryption["A192GCM"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A192GCM"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES'], JWEEncryption["A256GCM"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A256GCM"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A128KW and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A128CBC-HS256"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A128CBC-HS256"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A128KW and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A192CBC-HS384"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A192CBC-HS384"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A128KW and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A256CBC-HS512"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A256CBC-HS512"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A128KW and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A128GCM"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A128GCM"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A128KW and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A192GCM"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A192GCM"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A128KW and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A256GCM"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A256GCM"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A192KW and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A128CBC-HS256"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A128CBC-HS256"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A192KW and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A192CBC-HS384"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A192CBC-HS384"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A192KW and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A256CBC-HS512"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A256CBC-HS512"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A192KW and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A128GCM"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A128GCM"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A192KW and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A192GCM"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A192GCM"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A192KW and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A256GCM"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A192KW'], JWEEncryption["A256GCM"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A256KW and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A128CBC-HS256"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A128CBC-HS256"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A256KW and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A192CBC-HS384"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A192CBC-HS384"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A256KW and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A256CBC-HS512"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A256CBC-HS512"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A256KW and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A128GCM"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A128GCM"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A256KW and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A192GCM"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A192GCM"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using ECDH-ES+A256KW and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A256GCM"], ECDSAPublicKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A256KW'], JWEEncryption["A256GCM"], ECDSAPrivateKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A128GCMKW and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128GCMKW'], JWEEncryption["A128CBC-HS256"], AES128SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128GCMKW'], JWEEncryption["A128CBC-HS256"], AES128SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A128GCMKW and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128GCMKW'], JWEEncryption["A192CBC-HS384"], AES128SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128GCMKW'], JWEEncryption["A192CBC-HS384"], AES128SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A128GCMKW and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128GCMKW'], JWEEncryption["A256CBC-HS512"], AES128SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128GCMKW'], JWEEncryption["A256CBC-HS512"], AES128SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A128GCMKW and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128GCMKW'], JWEEncryption["A128GCM"], AES128SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128GCMKW'], JWEEncryption["A128GCM"], AES128SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A128GCMKW and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128GCMKW'], JWEEncryption["A192GCM"], AES128SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128GCMKW'], JWEEncryption["A192GCM"], AES128SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A128GCMKW and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A128GCMKW'], JWEEncryption["A256GCM"], AES128SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128GCMKW'], JWEEncryption["A256GCM"], AES128SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A192GCMKW and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192GCMKW'], JWEEncryption["A128CBC-HS256"], AES192SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192GCMKW'], JWEEncryption["A128CBC-HS256"], AES192SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A192GCMKW and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192GCMKW'], JWEEncryption["A192CBC-HS384"], AES192SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192GCMKW'], JWEEncryption["A192CBC-HS384"], AES192SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A192GCMKW and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192GCMKW'], JWEEncryption["A256CBC-HS512"], AES192SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192GCMKW'], JWEEncryption["A256CBC-HS512"], AES192SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A192GCMKW and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192GCMKW'], JWEEncryption["A128GCM"], AES192SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192GCMKW'], JWEEncryption["A128GCM"], AES192SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A192GCMKW and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192GCMKW'], JWEEncryption["A192GCM"], AES192SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192GCMKW'], JWEEncryption["A192GCM"], AES192SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A192GCMKW and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A192GCMKW'], JWEEncryption["A256GCM"], AES192SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A192GCMKW'], JWEEncryption["A256GCM"], AES192SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A256GCMKW and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256GCMKW'], JWEEncryption["A128CBC-HS256"], AES256SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256GCMKW'], JWEEncryption["A128CBC-HS256"], AES256SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A256GCMKW and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256GCMKW'], JWEEncryption["A192CBC-HS384"], AES256SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256GCMKW'], JWEEncryption["A192CBC-HS384"], AES256SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A256GCMKW and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256GCMKW'], JWEEncryption["A256CBC-HS512"], AES256SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256GCMKW'], JWEEncryption["A256CBC-HS512"], AES256SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A256GCMKW and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256GCMKW'], JWEEncryption["A128GCM"], AES256SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256GCMKW'], JWEEncryption["A128GCM"], AES256SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A256GCMKW and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256GCMKW'], JWEEncryption["A192GCM"], AES256SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256GCMKW'], JWEEncryption["A192GCM"], AES256SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using A256GCMKW and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['A256GCMKW'], JWEEncryption["A256GCM"], AES256SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256GCMKW'], JWEEncryption["A256GCM"], AES256SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS256+A128KW and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS256+A128KW'], JWEEncryption["A128CBC-HS256"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS256+A128KW'], JWEEncryption["A128CBC-HS256"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS256+A128KW and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS256+A128KW'], JWEEncryption["A192CBC-HS384"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS256+A128KW'], JWEEncryption["A192CBC-HS384"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS256+A128KW and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS256+A128KW'], JWEEncryption["A256CBC-HS512"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS256+A128KW'], JWEEncryption["A256CBC-HS512"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS256+A128KW and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS256+A128KW'], JWEEncryption["A128GCM"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS256+A128KW'], JWEEncryption["A128GCM"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS256+A128KW and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS256+A128KW'], JWEEncryption["A192GCM"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS256+A128KW'], JWEEncryption["A192GCM"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS256+A128KW and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS256+A128KW'], JWEEncryption["A256GCM"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS256+A128KW'], JWEEncryption["A256GCM"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS384+A192KW and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS384+A192KW'], JWEEncryption["A128CBC-HS256"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS384+A192KW'], JWEEncryption["A128CBC-HS256"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS384+A192KW and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS384+A192KW'], JWEEncryption["A192CBC-HS384"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS384+A192KW'], JWEEncryption["A192CBC-HS384"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS384+A192KW and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS384+A192KW'], JWEEncryption["A256CBC-HS512"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS384+A192KW'], JWEEncryption["A256CBC-HS512"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS384+A192KW and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS384+A192KW'], JWEEncryption["A128GCM"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS384+A192KW'], JWEEncryption["A128GCM"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS384+A192KW and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS384+A192KW'], JWEEncryption["A192GCM"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS384+A192KW'], JWEEncryption["A192GCM"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS384+A192KW and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS384+A192KW'], JWEEncryption["A256GCM"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS384+A192KW'], JWEEncryption["A256GCM"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS512+A256KW and A128CBC-HS256 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A128CBC-HS256"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A128CBC-HS256"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS512+A256KW and A192CBC-HS384 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A192CBC-HS384"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A192CBC-HS384"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS512+A256KW and A256CBC-HS512 and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A256CBC-HS512"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A256CBC-HS512"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS512+A256KW and A128GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A128GCM"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A128GCM"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS512+A256KW and A192GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A192GCM"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A192GCM"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });

        await it('should encrypt a JWT using PBES2-HS512+A256KW and A256GCM and decrypt it', () => {
            const jwe = encryptJWT(Buffer.from(JSON.stringify(payload)), 'application/json', JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A256GCM"], PBES2SymmetricKey);
            strictEqual(typeof jwe, 'string');

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A256GCM"], PBES2SymmetricKey);
            strictEqual(decryptedPayload.toString(), JSON.stringify(payload));
        });
    });

    await describe('Decrypt known JWEs', async () => {
        await it('should decrypt a known JWE using RSA-OAEP and A256GCM', () => {
            const RSAPrivateKey: RSAPrivateKey = {
                kty: 'RSA',
                n: 'oahUIoWw0K0usKNuOR6H4wkf4oBUXHTxRvgb48E-BVvxkeDNjbC4he8rUWcJoZmds2h7M70imEVhRU5djINXtqllXI4DFqcI1DgjT9LewND8MW2Krf3Spsk_ZkoFnilakGygTwpZ3uesH-PFABNIUYpOiN15dsQRkgr0vEhxN92i2asbOenSZeyaxziK72UwxrrKoExv6kc5twXTq4h-QChLOln0_mtUZwfsRaMStPs6mS6XrgxnxbWhojf663tuEQueGC-FCMfra36C9knDFGzKsNa7LZK2djYgyD3JR_MB_4NUJW_TqOQtwHYbxevoJArm-L5StowjzGy-_bq6Gw',
                e: 'AQAB',
                d: 'kLdtIj6GbDks_ApCSTYQtelcNttlKiOyPzMrXHeI-yk1F7-kpDxY4-WY5NWV5KntaEeXS1j82E375xxhWMHXyvjYecPT9fpwR_M9gV8n9Hrh2anTpTD93Dt62ypW3yDsJzBnTnrYu1iwWRgBKrEYY46qAZIrA2xAwnm2X7uGR1hghkqDp0Vqj3kbSCz1XyfCs6_LehBwtxHIyh8Ripy40p24moOAbgxVw3rxT_vlt3UVe4WO3JkJOzlpUf-KTVI2Ptgm-dARxTEtE-id-4OJr0h-K-VFs3VSndVTIznSxfyrj8ILL6MG_Uv8YAu7VILSB3lOW085-4qE3DzgrTjgyQ',
                p: '1r52Xk46c-LsfB5P442p7atdPUrxQSy4mti_tZI3Mgf2EuFVbUoDBvaRQ-SWxkbkmoEzL7JXroSBjSrK3YIQgYdMgyAEPTPjXv_hI2_1eTSPVZfzL0lffNn03IXqWF5MDFuoUYE0hzb2vhrlN_rKrbfDIwUbTrjjgieRbwC6Cl0',
                q: 'wLb35x7hmQWZsWJmB_vle87ihgZ19S8lBEROLIsZG4ayZVe9Hi9gDVCOBmUDdaDYVTSNx_8Fyw1YYa9XGrGnDew00J28cRUoeBB_jKI1oma0Orv1T9aXIWxKwd4gvxFImOWr3QRL9KEBRzk2RatUBnmDZJTIAfwTs0g68UZHvtc',
                dp: 'ZK-YwE7diUh0qR1tR7w8WHtolDx3MZ_OTowiFvgfeQ3SiresXjm9gZ5KLhMXvo-uz-KUJWDxS5pFQ_M0evdo1dKiRTjVw_x4NyqyXPM5nULPkcpU827rnpZzAJKpdhWAgqrXGKAECQH0Xt4taznjnd_zVpAmZZq60WPMBMfKcuE',
                dq: 'Dq0gfgJ1DdFGXiLvQEZnuKEN0UUmsJBxkjydc3j4ZYdBiMRAy86x0vHCjywcMlYYg4yoC4YZa9hNVcsjqA3FeiL19rk8g6Qn29Tt0cj8qqyFpz9vNDBUfCAiJVeESOjJDZPYHdHY8v1b-o-Z2X5tvLx-TCekf7oxyeKDUqKWjis',
                qi: 'VIMpMYbPf47dT1w_zDUXfPimsSegnMOA1zTaX7aGk_8urY6R8-ZW1FxU7AlWAyLWybqq6t16VFd7hQd0y6flUK4SlOydB61gwanOsXGOAOv82cHq0E3eL4HrtZkUuKvnPrMnsUUFlfUdybVzxyjz9JF_XyaY14ardLSjf4L_FNY'
            };

            const plainText = Buffer.from([84, 104, 101, 32, 116, 114, 117, 101, 32, 115, 105, 103, 110, 32, 111, 102, 32, 105, 110, 116, 101, 108, 108, 105, 103, 101, 110, 99, 101, 32, 105, 115, 32, 110, 111, 116, 32, 107, 110, 111, 119, 108, 101, 100, 103, 101, 32, 98, 117, 116, 32, 105, 109, 97, 103, 105, 110, 97, 116, 105, 111, 110, 46]);

            const jwe = 'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ.OKOawDo13gRp2ojaHV7LFpZcgV7T6DVZKTyKOMTYUmKoTCVJRgckCL9kiMT03JGeipsEdY3mx_etLbbWSrFr05kLzcSr4qKAq7YN7e9jwQRb23nfa6c9d-StnImGyFDbSv04uVuxIp5Zms1gNxKKK2Da14B8S4rzVRltdYwam_lDp5XnZAYpQdb76FdIKLaVmqgfwX7XWRxv2322i-vDxRfqNzo_tETKzpVLzfiwQyeyPGLBIO56YJ7eObdv0je81860ppamavo35UgoRdbYaBcoh9QcfylQr66oc6vFWXRcZ_ZT2LawVCWTIy3brGPi6UklfCpIMfIjf7iGdXKHzg.48V1_ALb6US04U3b.5eym8TW_c8SuK0ltJ3rpYIzOeDQz7TALvtu6UG9oMo4vpzs9tX_EFShS8iB7j6jiSdiwkIr3ajwQzaBtQD_A.XFBoMYUZodetZdvTiFvSkQ';

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA-OAEP'], JWEEncryption["A256GCM"], RSAPrivateKey);

            ok(plainText.equals(decryptedPayload));
        });

        await it('should decrypt a known JWE using RSA-1_5 and A128CBC-HS256', () => {
            const RSAPrivateKey: RSAPrivateKey = {
                kty: 'RSA',
                n: 'sXchDaQebHnPiGvyDOAT4saGEUetSyo9MKLOoWFsueri23bOdgWp4Dy1WlUzewbgBHod5pcM9H95GQRV3JDXboIRROSBigeC5yjU1hGzHHyXss8UDprecbAYxknTcQkhslANGRUZmdTOQ5qTRsLAt6BTYuyvVRdhS8exSZEy_c4gs_7svlJJQ4H9_NxsiIoLwAEk7-Q3UXERGYw_75IDrGA84-lA_-Ct4eTlXHBIY2EaV7t7LjJaynVJCpkv4LKjTTAumiGUIuQhrNhZLuF_RJLqHpM2kgWFLU7-VTdL1VbC2tejvcI2BlMkEpk1BzBZI0KQB0GaDWFLN-aEAw3vRw',
                e: 'AQAB',
                d: 'VFCWOqXr8nvZNyaaJLXdnNPXZKRaWCjkU5Q2egQQpTBMwhprMzWzpR8Sxq1OPThh_J6MUD8Z35wky9b8eEO0pwNS8xlh1lOFRRBoNqDIKVOku0aZb-rynq8cxjDTLZQ6Fz7jSjR1Klop-YKaUHc9GsEofQqYruPhzSA-QgajZGPbE_0ZaVDJHfyd7UUBUKunFMScbflYAAOYJqVIVwaYR5zWEEceUjNnTNo_CVSj-VvXLO5VZfCUAVLgW4dpf1SrtZjSt34YLsRarSb127reG_DUwg9Ch-KyvjT1SkHgUWRVGcyly7uvVGRSDwsXypdrNinPA4jlhoNdizK2zF2CWQ',
                p: '9gY2w6I6S6L0juEKsbeDAwpd9WMfgqFoeA9vEyEUuk4kLwBKcoe1x4HG68ik918hdDSE9vDQSccA3xXHOAFOPJ8R9EeIAbTi1VwBYnbTp87X-xcPWlEPkrdoUKW60tgs1aNd_Nnc9LEVVPMS390zbFxt8TN_biaBgelNgbC95sM',
                q: 'uKlCKvKv_ZJMVcdIs5vVSU_6cPtYI1ljWytExV_skstvRSNi9r66jdd9-yBhVfuG4shsp2j7rGnIio901RBeHo6TPKWVVykPu1iYhQXw1jIABfw-MVsN-3bQ76WLdt2SDxsHs7q7zPyUyHXmps7ycZ5c72wGkUwNOjYelmkiNS0',
                dp: 'w0kZbV63cVRvVX6yk3C8cMxo2qCM4Y8nsq1lmMSYhG4EcL6FWbX5h9yuvngs4iLEFk6eALoUS4vIWEwcL4txw9LsWH_zKI-hwoReoP77cOdSL4AVcraHawlkpyd2TWjE5evgbhWtOxnZee3cXJBkAi64Ik6jZxbvk-RR3pEhnCs',
                dq: 'o_8V14SezckO6CNLKs_btPdFiO9_kC1DsuUTd2LAfIIVeMZ7jn1Gus_Ff7B7IVx3p5KuBGOVF8L-qifLb6nQnLysgHDh132NDioZkhH7mI7hPG-PYE_odApKdnqECHWw0J-F0JWnUd6D2B_1TvF9mXA2Qx-iGYn8OVV1Bsmp6qU',
                qi: 'eNho5yRBEBxhGBtQRww9QirZsB66TrfFReG_CcteI1aCneT0ELGhYlRlCtUkTRclIfuEPmNsNDPbLoLqqCVznFbvdB7x-Tl-m0l_eFTj2KiqwGqE9PZB9nNTwMVvH3VRRSLWACvPnSiwP8N5Usy-WRXS-V7TbpxIhvepTfE0NNo'
            };

            const plainText = Buffer.from([76, 105, 118, 101, 32, 108, 111, 110, 103, 32, 97, 110, 100, 32, 112, 114, 111, 115, 112, 101, 114, 46]);

            const jwe = 'eyJhbGciOiJSU0ExXzUiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0.UGhIOguC7IuEvf_NPVaXsGMoLOmwvc1GyqlIKOK1nN94nHPoltGRhWhw7Zx0-kFm1NJn8LE9XShH59_i8J0PH5ZZyNfGy2xGdULU7sHNF6Gp2vPLgNZ__deLKxGHZ7PcHALUzoOegEI-8E66jX2E4zyJKx-YxzZIItRzC5hlRirb6Y5Cl_p-ko3YvkkysZIFNPccxRU7qve1WYPxqbb2Yw8kZqa2rMWI5ng8OtvzlV7elprCbuPhcCdZ6XDP0_F8rkXds2vE4X-ncOIM8hAYHHi29NX0mcKiRaD0-D-ljQTP-cFPgwCp6X-nZZd9OHBv-B3oWh2TbqmScqXMR4gp_A.AxY8DCtDaGlsbGljb3RoZQ.KDlTtXchhZTGufMYmOYGS4HffxPSUrfmqCHXaI9wOGY.9hH0vgRfYgPnAHOd8stkvw';

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['RSA1_5'], JWEEncryption["A128CBC-HS256"], RSAPrivateKey);

            ok(plainText.equals(decryptedPayload));
        });

        await it('should decrypt a known JWE using A128KW and A128CBC-HS256', () => {
            const AES256SymmetricKey: SymmetricKey = {
                kty: 'oct',
                k: 'GawgguFyGrWKav7AX4VKUg'
            };

            const plainText = Buffer.from([76, 105, 118, 101, 32, 108, 111, 110, 103, 32, 97, 110, 100, 32, 112, 114, 111, 115, 112, 101, 114, 46]);

            const jwe = 'eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0.6KB707dM9YTIgHtLvtgWQ8mKwboJW3of9locizkDTHzBC2IlrT1oOQ.AxY8DCtDaGlsbGljb3RoZQ.KDlTtXchhZTGufMYmOYGS4HffxPSUrfmqCHXaI9wOGY.U0m_YmjN04DJvceFICbCVQ';

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A128KW'], JWEEncryption["A128CBC-HS256"], AES256SymmetricKey);

            ok(plainText.equals(decryptedPayload));
        });

        await it('should decrypt a known JWE using ECDH-ES and A256GCM', () => {
            const ECDSAPrivateKey: ECPrivateKey = {
                kty: 'EC',
                crv: 'P-256',
                x: 'gI0GAILBdu7T53akrFmMyGcsF3n5dO7MmwNBHKW5SV0',
                y: 'SLW_xSffzlPWrHEVI30DHM_4egVwt3NQqeUD7nMFpps',
                d: '0_NxaRPUMQoAJt50Gz8YiTr8gRTwyEaCumd-MToTmIo'
            };

            const plainText = Buffer.from('The arcana is the means by which all is revealed.', 'utf8');

            const jwe = 'eyJhbGciOiJFQ0RILUVTIiwiZW5jIjoiQTI1NkdDTSIsInR5cCI6IkpXVCIsImN0eSI6InRleHQvcGxhaW4iLCJlcGsiOnsia3R5IjoiRUMiLCJjcnYiOiJQLTI1NiIsIngiOiJsZE5pWDMzMkRXemtxVFpMUjJJVzh6QVk1ek0tQW5BZDEwVXVRNG4yLWY4IiwieSI6IlFBRXJJT21ldkgwN293eTllT2Ewd2V0bUhRUVdQTFc2YXRWa1lJcDRZVFUifX0..T-edkewrQ-b6y7vD.2X_-2c1zeRD6ZVt7p0A0doAYMrUy9E3CMN1PAt2mY6n8ztMWtgdVxP0Y8qqCmNoHYg.D9QZtAbwHi0XYXKne9xO9g';

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES'], JWEEncryption["A256GCM"], ECDSAPrivateKey);

            ok(plainText.equals(decryptedPayload));
        });

        await it('should decrypt a known JWE using ECDH-ES+A128KW and A128GCM', () => {
            const ECDSAPrivateKey: ECPrivateKey = {
                kty: 'EC',
                crv: 'P-256',
                key_ops: ['deriveKey', 'deriveBits'],
                d: 'vPZxnkg-j1xZ_8BZfH6jIvV52NvG2pxsZhmYgI9BEec',
                x: 'CorZZG9qa5korQ6eVLenbFz2QyGKkpoEYlAJxF1JzGA',
                y: 'yIEnQSGlMNVp6JEzZO3QvjQ0UDAwepzUZqwgsv0OTQE',
            };

            const plainText = Buffer.from('8807', 'utf8');

            const jwe = 'eyJhbGciOiJFQ0RILUVTK0ExMjhLVyIsImVuYyI6IkExMjhHQ00iLCJraWQiOiJhYmMxMjMiLCJlcGsiOnsia3R5IjoiRUMiLCJ4IjoiNmNReW1GUlJSTjVkVHdoOHA5dWx1NkgwS3paSkRGcm4xdjFKb2NzVURCUSIsInkiOiJTSGliQjFEMnBHMmVMbUxMV09HTTB4UUtCRDFpM3ZtZjJRNjZIM2RnbzJ3IiwiY3J2IjoiUC0yNTYifX0.OwriqBm-PXkIj_QwbqKZRVxql0sja2-p.UrZs5Ixu_rFCxpCw.z9Rfhw.m6AgqKsttsp9TV2dREgbWw';

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['ECDH-ES+A128KW'], JWEEncryption["A128GCM"], ECDSAPrivateKey);

            ok(plainText.equals(decryptedPayload));
        });

        await it('should decrypt a known JWE using A256GCMKW and A256GCM', () => {
            const AES128SymmetricKey: SymmetricKey = {
                kty: 'oct',
                k: createHash('sha256').update(Buffer.from('asdfgasdfgasdfgasdfgasdfgasdfgasdfgasdfg', 'utf8')).digest().toString('base64url'),
            };

            const plainText = Buffer.from('The quick brown fox jumps over the lazy dog.', 'utf8');

            const jwe = 'eyJhbGciOiJBMjU2R0NNS1ciLCJlbmMiOiJBMjU2R0NNIiwidGFnIjoiVVhtb0dwbzI5V0o0MHNsWHZXc3FXUSIsIml2IjoiMVk3WWxPYjRTNjB1eVFrMyJ9.T7wX7Dt6WhPPkxUmrHgKLbQ3nscNiJ9laz31cwsPYsk.FbigNoLKXNgT_oKF.Sotu5vgQOcdt7gNA8l1lIUmwa-40z7tHWPb951XGjqemVMqcldaD4p_XhXQ.fVuNdAZDPun7KYjKsx06jw';

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['A256GCMKW'], JWEEncryption["A256GCM"], AES128SymmetricKey);

            ok(plainText.equals(decryptedPayload));
        });

        await it('should decrypt a known JWE using PBES2-HS512+A256KW and A128CBC-HS256', () => {
            const PBES2SymmetricKey: SymmetricKey = {
                kty: 'oct',
                k: Buffer.from("entrap_o\xe2\x80\x93peter_long\xe2\x80\x93credit_tun", 'ascii').toString('base64url')
            };

            const plainText = Buffer.from(JSON.stringify({
                keys: [
                    {
                        kty: 'oct',
                        kid: '77c7e2b8-6e13-45cf-8672-617b5b45243a',
                        use: 'enc',
                        alg: 'A128GCM',
                        k: 'XctOhJAkA-pD9Lh7ZgW_2A'
                    },
                    {
                        kty: 'oct',
                        kid: '81b20965-8332-43d9-a468-82160ad91ac8',
                        use: 'enc',
                        alg: 'A128KW',
                        k: 'GZy6sIZ6wl9NJOKB-jnmVQ'
                    },
                    {
                        kty: 'oct',
                        kid: '18ec08e1-bfa9-4d95-b205-2b4dd1d4321d',
                        use: 'enc',
                        alg: 'A256GCMKW',
                        k: 'qC57l_uxcm7Nm3K-ct4GFjx8tM1U8CZ0NLBvdQstiS8'
                    }
                ]
            }), 'utf8');

            const jwe = 'eyJhbGciOiJQQkVTMi1IUzUxMitBMjU2S1ciLCJwMnMiOiI4UTFTemluYXNSM3hjaFl6NlpaY0hBIiwicDJjIjo4MTkyLCJjdHkiOiJqd2stc2V0K2pzb24iLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0.d3qNhUWfqheyPp4H8sjOWsDYajoej4c5Je6rlUtFPWdgtURtmeDV1g.VBiCzVHNoLiR3F4V82uoTQ.23i-Tb1AV4n0WKVSSgcQrdg6GRqsUKxjruHXYsTHAJLZ2nsnGIX86vMXqIi6IRsfywCRFzLxEcZBRnTvG3nhzPk0GDD7FMyXhUHpDjEYCNA_XOmzg8yZR9oyjo6lTF6si4q9FZ2EhzgFQCLO_6h5EVg3vR75_hkBsnuoqoM3dwejXBtIodN84PeqMb6asmas_dpSsz7H10fC5ni9xIz424givB1YLldF6exVmL93R3fOoOJbmk2GBQZL_SEGllv2cQsBgeprARsaQ7Bq99tT80coH8ItBjgV08AtzXFFsx9qKvC982KLKdPQMTlVJKkqtV4Ru5LEVpBZXBnZrtViSOgyg6AiuwaS-rCrcD_ePOGSuxvgtrokAKYPqmXUeRdjFJwafkYEkiuDCV9vWGAi1DH2xTafhJwcmywIyzi4BqRpmdn_N-zl5tuJYyuvKhjKv6ihbsV_k1hJGPGAxJ6wUpmwC4PTQ2izEm0TuSE8oMKdTw8V3kobXZ77ulMwDs4p.0HlwodAhOCILG5SQ2LQ9dg';

            const decryptedPayload = decryptJWE(jwe, JWEAlgorithm['PBES2-HS512+A256KW'], JWEEncryption["A128CBC-HS256"], PBES2SymmetricKey);

            ok(plainText.equals(decryptedPayload));
        });
    });
});
