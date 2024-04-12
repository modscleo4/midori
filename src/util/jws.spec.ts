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
import { ECPrivateKey, ECPublicKey, RSAPrivateKey, RSAPublicKey, SymmetricKey } from './jwk.js';

await describe('JWS', async () => {
    await describe('Verify after sign', async () => {
        const payload: JWTPayload = {
            iss: 'www.example.com',
            aud: 'www.example.com',
            sub: 'joe',
            iat: 1300819380,
        };

        const { publicKey: RSAPublicKeyPEM, privateKey: RSAPrivateKeyPEM } = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
        const RSAPublicKey = createPublicKey(RSAPublicKeyPEM).export({ format: 'jwk' }) as RSAPublicKey;
        const RSAPrivateKey = createPrivateKey(RSAPrivateKeyPEM).export({ format: 'jwk' }) as RSAPrivateKey;

        const { publicKey: ECDSAPublicKeyPEM, privateKey: ECDSAPrivateKeyPEM } = generateKeyPairSync('ec', { namedCurve: 'P-256', publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'sec1', format: 'pem' } });
        const ECDSAPublicKey = createPublicKey(ECDSAPublicKeyPEM).export({ format: 'jwk' }) as ECPublicKey;
        const ECDSAPrivateKey = createPrivateKey(ECDSAPrivateKeyPEM).export({ format: 'jwk' }) as ECPrivateKey;

        const HMACKeyRaw = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'utf8');
        const HMACKey: SymmetricKey = { kty: 'oct', k: HMACKeyRaw.toString('base64url') };

        await it('should sign a JWT using HS256 and verify it', () => {
            const jws = signJWT(payload, JWSAlgorithm['HS256'], HMACKey);
            strictEqual(typeof jws, 'string');

            const verified = verifyJWS(jws, JWSAlgorithm['HS256'], HMACKey);
            ok(verified);
        });

        await it('should sign a JWT using HS384 and verify it', () => {
            const jws = signJWT(payload, JWSAlgorithm['HS384'], HMACKey);
            strictEqual(typeof jws, 'string');

            const verified = verifyJWS(jws, JWSAlgorithm['HS384'], HMACKey);
            ok(verified);
        });

        await it('should sign a JWT using HS512 and verify it', () => {
            const jws = signJWT(payload, JWSAlgorithm['HS512'], HMACKey);
            strictEqual(typeof jws, 'string');

            const verified = verifyJWS(jws, JWSAlgorithm['HS512'], HMACKey);
            ok(verified);
        });

        await it('should sign a JWT using RS256 and verify it', () => {
            const jws = signJWT(payload, JWSAlgorithm['RS256'], RSAPrivateKey);
            strictEqual(typeof jws, 'string');

            const verified = verifyJWS(jws, JWSAlgorithm['RS256'], RSAPublicKey);
            ok(verified);
        });

        await it('should sign a JWT using RS384 and verify it', () => {
            const jws = signJWT(payload, JWSAlgorithm['RS384'], RSAPrivateKey);
            strictEqual(typeof jws, 'string');

            const verified = verifyJWS(jws, JWSAlgorithm['RS384'], RSAPublicKey);
            ok(verified);
        });

        await it('should sign a JWT using RS512 and verify it', () => {
            const jws = signJWT(payload, JWSAlgorithm['RS512'], RSAPrivateKey);
            strictEqual(typeof jws, 'string');

            const verified = verifyJWS(jws, JWSAlgorithm['RS512'], RSAPublicKey);
            ok(verified);
        });

        await it('should sign a JWT using PS256 and verify it', () => {
            const jws = signJWT(payload, JWSAlgorithm['PS256'], RSAPrivateKey);
            strictEqual(typeof jws, 'string');

            const verified = verifyJWS(jws, JWSAlgorithm['PS256'], RSAPublicKey);
            ok(verified);
        });

        await it('should sign a JWT using PS384 and verify it', () => {
            const jws = signJWT(payload, JWSAlgorithm['PS384'], RSAPrivateKey);
            strictEqual(typeof jws, 'string');

            const verified = verifyJWS(jws, JWSAlgorithm['PS384'], RSAPublicKey);
            ok(verified);
        });

        await it('should sign a JWT using PS512 and verify it', () => {
            const jws = signJWT(payload, JWSAlgorithm['PS512'], RSAPrivateKey);
            strictEqual(typeof jws, 'string');

            const verified = verifyJWS(jws, JWSAlgorithm['PS512'], RSAPublicKey);
            ok(verified);
        });

        await it('should sign a JWT using ES256 and verify it', () => {
            const jws = signJWT(payload, JWSAlgorithm['ES256'], ECDSAPrivateKey);
            strictEqual(typeof jws, 'string');

            const verified = verifyJWS(jws, JWSAlgorithm['ES256'], ECDSAPublicKey);
            ok(verified);
        });

        await it('should sign a JWT using ES384 and verify it', () => {
            const jws = signJWT(payload, JWSAlgorithm['ES384'], ECDSAPrivateKey);
            strictEqual(typeof jws, 'string');

            const verified = verifyJWS(jws, JWSAlgorithm['ES384'], ECDSAPublicKey);
            ok(verified);
        });

        await it('should sign a JWT using ES512 and verify it', () => {
            const jws = signJWT(payload, JWSAlgorithm['ES512'], ECDSAPrivateKey);
            strictEqual(typeof jws, 'string');

            const verified = verifyJWS(jws, JWSAlgorithm['ES512'], ECDSAPublicKey);
            ok(verified);
        });
    });

    await describe('Verify known JWS', async () => {
        await it('should verify a known JWS using HS256', () => {
            const HMACKey: SymmetricKey = {
                kty: 'oct',
                k: 'AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow'
            };

            const jws = 'eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

            const verified = verifyJWS(jws, JWSAlgorithm['HS256'], HMACKey);
            ok(verified);
        });

        await it('should verify a known JWS using RS256', () => {
            const RSAPrivateKey: RSAPrivateKey = {
                kty: 'RSA',
                n: 'ofgWCuLjybRlzo0tZWJjNiuSfb4p4fAkd_wWJcyQoTbji9k0l8W26mPddxHmfHQp-Vaw-4qPCJrcS2mJPMEzP1Pt0Bm4d4QlL-yRT-SFd2lZS-pCgNMsD1W_YpRPEwOWvG6b32690r2jZ47soMZo9wGzjb_7OMg0LOL-bSf63kpaSHSXndS5z5rexMdbBYUsLA9e-KXBdQOS-UTo7WTBEMa2R2CapHg665xsmtdVMTBQY4uDZlxvb3qCo5ZwKh9kG4LT6_I5IhlJH7aGhyxXFvUK-DWNmoudF8NAco9_h9iaGNj8q2ethFkMLs91kzk2PAcDTW9gb54h4FRWyuXpoQ',
                e: 'AQAB',
                d: 'Eq5xpGnNCivDflJsRQBXHx1hdR1k6Ulwe2JZD50LpXyWPEAeP88vLNO97IjlA7_GQ5sLKMgvfTeXZx9SE-7YwVol2NXOoAJe46sui395IW_GO-pWJ1O0BkTGoVEn2bKVRUCgu-GjBVaYLU6f3l9kJfFNS3E0QbVdxzubSu3Mkqzjkn439X0M_V51gfpRLI9JYanrC4D4qAdGcopV_0ZHHzQlBjudU2QvXt4ehNYTCBr6XCLQUShb1juUO1ZdiYoFaFQT5Tw8bGUl_x_jTj3ccPDVZFD9pIuhLhBOneufuBiB4cS98l2SR_RQyGWSeWjnczT0QU91p1DhOVRuOopznQ',
                p: '4BzEEOtIpmVdVEZNCqS7baC4crd0pqnRH_5IB3jw3bcxGn6QLvnEtfdUdiYrqBdss1l58BQ3KhooKeQTa9AB0Hw_Py5PJdTJNPY8cQn7ouZ2KKDcmnPGBY5t7yLc1QlQ5xHdwW1VhvKn-nXqhJTBgIPgtldC-KDV5z-y2XDwGUc',
                q: 'uQPEfgmVtjL0Uyyx88GZFF1fOunH3-7cepKmtH4pxhtCoHqpWmT8YAmZxaewHgHAjLYsp1ZSe7zFYHj7C6ul7TjeLQeZD_YwD66t62wDmpe_HlB-TnBA-njbglfIsRLtXlnDzQkv5dTltRJ11BKBBypeeF6689rjcJIDEz9RWdc',
                dp: 'BwKfV3Akq5_MFZDFZCnW-wzl-CCo83WoZvnLQwCTeDv8uzluRSnm71I3QCLdhrqE2e9YkxvuxdBfpT_PI7Yz-FOKnu1R6HsJeDCjn12Sk3vmAktV2zb34MCdy7cpdTh_YVr7tss2u6vneTwrA86rZtu5Mbr1C1XsmvkxHQAdYo0',
                dq: 'h_96-mK1R_7glhsum81dZxjTnYynPbZpHziZjeeHcXYsXaaMwkOlODsWa7I9xXDoRwbKgB719rrmI2oKr6N3Do9U0ajaHF-NKJnwgjMd2w9cjz3_-kyNlxAr2v4IKhGNpmM5iIgOS1VZnOZ68m6_pbLBSp3nssTdlqvd0tIiTHU',
                qi: 'IYd7DHOhrWvxkwPQsRM2tOgrjbcrfvtQJipd-DlcxyVuuM9sQLdgjVk2oy26F0EmpScGLq2MowX7fhd_QJQ3ydy5cY7YIBi87w93IKLEdfnbJtoOPLUW0ITrJReOgo1cq9SbsxYawBgfp_gh6A5603k2-ZQwVK0JKSHuLFkuQ3U'
            };

            const jws = 'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.cC4hiUPoj9Eetdgtv3hF80EGrhuB__dzERat0XF9g2VtQgr9PJbu3XOiZj5RZmh7AAuHIm4Bh-0Qc_lF5YKt_O8W2Fp5jujGbds9uJdbF9CUAr7t1dnZcAcQjbKBYNX4BAynRFdiuB--f_nZLgrnbyTyWzO75vRK5h6xBArLIARNPvkSjtQBMHlb1L07Qe7K0GarZRmB_eSN9383LcOLn6_dO--xi12jzDwusC-eOkHWEsqtFZESc6BfI7noOPqvhJ1phCnvWh6IeYI2w9QOYEUipUTI8np6LbgGY9Fs98rqVt5AXLIhWkWywlVmtVrBp0igcN_IoypGlUPQGe77Rw';

            const verified = verifyJWS(jws, JWSAlgorithm['RS256'], RSAPrivateKey);
            ok(verified);
        });

        await it('should verify a known JWS using ES256', () => {
            const ECDSAPrivateKey: ECPrivateKey = {
                kty: 'EC',
                crv: 'P-256',
                x: 'f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU',
                y: 'x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0',
                d: 'jpsQnnGQmL-YBIffH1136cspYG6-0iY7X1fCE9-E9LI'
            };

            const jws = 'eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.DtEhU3ljbEg8L38VWAfUAqOyKAM6-Xx-F4GawxaepmXFCgfTjDxw5djxLa8ISlSApmWQxfKTUJqPP3-Kg6NU1Q';

            const verified = verifyJWS(jws, JWSAlgorithm['ES256'], ECDSAPrivateKey);
            ok(verified);
        });

        await it('should verify a known JWS using ES512', () => {
            const ECDSAPrivateKey: ECPrivateKey = {
                kty: 'EC',
                crv: 'P-521',
                x: 'AekpBQ8ST8a8VcfVOTNl353vSrDCLLJXmPk06wTjxrrjcBpXp5EOnYG_NjFZ6OvLFV1jSfS9tsz4qUxcWceqwQGk',
                y: 'ADSmRA43Z1DSNx_RvcLI87cdL07l6jQyyBXMoxVg_l2Th-x3S1WDhjDly79ajL4Kkd0AZMaZmh9ubmf63e3kyMj2',
                d: 'AY5pb7A0UFiB3RELSD64fTLOSV_jazdF7fLYyuTw8lOfRhWg6Y6rUrPAxerEzgdRhajnu0ferB0d53vM9mE15j2C'
            };

            const jws = 'eyJhbGciOiJFUzUxMiJ9.UGF5bG9hZA.AdwMgeerwtHoh-l192l60hp9wAHZFVJbLfD_UxMi70cwnZOYaRI1bKPWROc-mZZqwqT2SI-KGDKB34XO0aw_7XdtAG8GaSwFKdCAPZgoXD2YBJZCPEX3xKpRwcdOO8KpEHwJjyqOgzDO7iKvU8vcnwNrmxYbSW9ERBXukOXolLzeO_Jn';

            const verified = verifyJWS(jws, JWSAlgorithm['ES512'], ECDSAPrivateKey);
            ok(verified);
        });
    });
});
