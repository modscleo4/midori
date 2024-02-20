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
import { strictEqual, ok } from 'node:assert';
import { createPrivateKey, createPublicKey, generateKeyPairSync, randomBytes } from 'node:crypto';

import { signJWT, verifyJWS, JWSAlgorithm, Header } from './jws.js';
import { Payload as JWTPayload } from './jwt.js';

describe('JWS', () => {
    const payload: JWTPayload = {
        iss: 'www.example.com',
        aud: 'www.example.com',
        sub: 'joe',
        iat: 1300819380,
    };

    const { publicKey: RSAPublicKeyPEM, privateKey: RSAPrivateKeyPEM } = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
    const RSAPublicKey = createPublicKey(RSAPublicKeyPEM).export({ format: 'jwk' });
    const RSAPrivateKey = createPrivateKey(RSAPrivateKeyPEM).export({ format: 'jwk' });

    const { publicKey: ECDSAPublicKeyPEM, privateKey: ECDSAPrivateKeyPEM } = generateKeyPairSync('ec', { namedCurve: 'P-256', publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'sec1', format: 'pem' } });
    const ECDSAPublicKey = createPublicKey(ECDSAPublicKeyPEM).export({ format: 'jwk' });
    const ECDSAPrivateKey = createPrivateKey(ECDSAPrivateKeyPEM).export({ format: 'jwk' });

    const HMACKeyRaw = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'utf8');
    const HMACKey = { kty: 'oct', k: HMACKeyRaw.toString('base64url') };

    it('should sign a JWT using HS256 and decrypt it', () => {
        const jws = signJWT(payload, JWSAlgorithm['HS256'], HMACKey);
        strictEqual(typeof jws, 'string');

        const verified = verifyJWS(jws, JWSAlgorithm['HS256'], HMACKey);
        ok(verified);
    });

    it('should sign a JWT using HS384 and decrypt it', () => {
        const jws = signJWT(payload, JWSAlgorithm['HS384'], HMACKey);
        strictEqual(typeof jws, 'string');

        const verified = verifyJWS(jws, JWSAlgorithm['HS384'], HMACKey);
        ok(verified);
    });

    it('should sign a JWT using HS512 and decrypt it', () => {
        const jws = signJWT(payload, JWSAlgorithm['HS512'], HMACKey);
        strictEqual(typeof jws, 'string');

        const verified = verifyJWS(jws, JWSAlgorithm['HS512'], HMACKey);
        ok(verified);
    });

    it('should sign a JWT using RS256 and decrypt it', () => {
        const jws = signJWT(payload, JWSAlgorithm['RS256'], RSAPrivateKey);
        strictEqual(typeof jws, 'string');

        const verified = verifyJWS(jws, JWSAlgorithm['RS256'], RSAPublicKey);
        ok(verified);
    });

    it('should sign a JWT using RS384 and decrypt it', () => {
        const jws = signJWT(payload, JWSAlgorithm['RS384'], RSAPrivateKey);
        strictEqual(typeof jws, 'string');

        const verified = verifyJWS(jws, JWSAlgorithm['RS384'], RSAPublicKey);
        ok(verified);
    });

    it('should sign a JWT using RS512 and decrypt it', () => {
        const jws = signJWT(payload, JWSAlgorithm['RS512'], RSAPrivateKey);
        strictEqual(typeof jws, 'string');

        const verified = verifyJWS(jws, JWSAlgorithm['RS512'], RSAPublicKey);
        ok(verified);
    });

    it('should sign a JWT using PS256 and decrypt it', () => {
        const jws = signJWT(payload, JWSAlgorithm['PS256'], RSAPrivateKey);
        strictEqual(typeof jws, 'string');

        const verified = verifyJWS(jws, JWSAlgorithm['PS256'], RSAPublicKey);
        ok(verified);
    });

    it('should sign a JWT using PS384 and decrypt it', () => {
        const jws = signJWT(payload, JWSAlgorithm['PS384'], RSAPrivateKey);
        strictEqual(typeof jws, 'string');

        const verified = verifyJWS(jws, JWSAlgorithm['PS384'], RSAPublicKey);
        ok(verified);
    });

    it('should sign a JWT using PS512 and decrypt it', () => {
        const jws = signJWT(payload, JWSAlgorithm['PS512'], RSAPrivateKey);
        strictEqual(typeof jws, 'string');

        const verified = verifyJWS(jws, JWSAlgorithm['PS512'], RSAPublicKey);
        ok(verified);
    });

    it('should sign a JWT using ES256 and decrypt it', () => {
        const jws = signJWT(payload, JWSAlgorithm['ES256'], ECDSAPrivateKey);
        strictEqual(typeof jws, 'string');

        const verified = verifyJWS(jws, JWSAlgorithm['ES256'], ECDSAPublicKey);
        ok(verified);
    });

    it('should sign a JWT using ES384 and decrypt it', () => {
        const jws = signJWT(payload, JWSAlgorithm['ES384'], ECDSAPrivateKey);
        strictEqual(typeof jws, 'string');

        const verified = verifyJWS(jws, JWSAlgorithm['ES384'], ECDSAPublicKey);
        ok(verified);
    });

    it('should sign a JWT using ES512 and decrypt it', () => {
        const jws = signJWT(payload, JWSAlgorithm['ES512'], ECDSAPrivateKey);
        strictEqual(typeof jws, 'string');

        const verified = verifyJWS(jws, JWSAlgorithm['ES512'], ECDSAPublicKey);
        ok(verified);
    });
});
