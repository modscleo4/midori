/**
 * Copyright 2024 Dhiego Cassiano Fogaça Barbosa
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
import { ok, deepStrictEqual, throws, doesNotThrow } from 'node:assert';
import { createPrivateKey, createPublicKey, generateKeyPairSync } from 'node:crypto';
import { parseDER, ecPublicKeyToRaw, ecPrivateKeyToRaw, type DERValue } from './asn1.js';
import ECDH from './crypt/ecdh.js';
import { ECPrivateKey, ECPublicKey } from './jwk.js';

await describe('parseDER', async () => {
    const { publicKey: rsaPublicKey, privateKey: rsaPrivateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
    const { publicKey: ecPublicKey, privateKey: ecPrivateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256', publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });

    await it('should parse a BOOLEAN', () => {
        const buffer = Buffer.from([0x01, 0x01, 0xff]); // BOOLEAN: true
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'BOOLEAN', value: true });
    });

    await it('should parse an INTEGER', () => {
        const buffer = Buffer.from([0x02, 0x01, 0x05]); // INTEGER: 5
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'INTEGER', value: 5n });
    });

    await it('should parse a BIT STRING', () => {
        const buffer = Buffer.from([0x03, 0x03, 0x00, 0xaa, 0xbb]); // BIT STRING: 0xaa, 0xbb
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'BIT STRING', value: Buffer.from([0xaa, 0xbb]) });
    });

    await it('should parse an OCTET STRING', () => {
        const buffer = Buffer.from([0x04, 0x03, 0x48, 0x65, 0x6c]); // OCTET STRING: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'OCTET STRING', value: Buffer.from('Hel') });
    });

    await it('should parse a NULL', () => {
        const buffer = Buffer.from([0x05, 0x00]); // NULL
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'NULL', value: null });
    });

    await it('should parse an OBJECT IDENTIFIER', () => {
        const buffer = Buffer.from([0x06, 0x03, 0x2a, 0x86, 0x48]); // OBJECT IDENTIFIER: 1.2.840
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'OBJECT IDENTIFIER', value: '1.2.840' });
    });

    await it('should parse an ObjectDescriptor', () => {
        const buffer = Buffer.from([0x07, 0x03, 0x48, 0x65, 0x6c]); // ObjectDescriptor: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'ObjectDescriptor', value: 'Hel' });
    });

    await it('should parse an REAL', () => {
        const buffer = Buffer.from([0x09, 0x03, 0x80, 0x00, 0x0A]); // REAL: { mantissa 10, base 2, exponent 0 }
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'REAL', value: { mantissa: 10, base: 2, exponent: 0 } });
    });

    await it('should parse an ENUMERATED', () => {
        const buffer = Buffer.from([0x0a, 0x01, 0x05]); // ENUMERATED: 5
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'ENUMERATED', value: 5n });
    });

    await it('should parse an UTF8String', () => {
        const buffer = Buffer.from([0x0c, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]); // UTF8String: "Hello"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'UTF8String', value: 'Hello' });
    });

    await it('should parse a TIME', () => {
        const buffer = Buffer.from([0x0d, 0x0f, 0x32, 0x30, 0x32, 0x32, 0x30, 0x31, 0x30, 0x31]); // TIME: 2022-01-01
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'TIME', value: { year: 2022, month: 1, day: 1 } });
    });

    await it('should parse a SEQUENCE', () => {
        const buffer = Buffer.from([
            0x30, 0x06, // SEQUENCE: 6 bytes
            0x02, 0x01, 0x05, // INTEGER: 5
            0x05, 0x00 // NULL
        ]);
        const result = parseDER(buffer);
        deepStrictEqual(result, {
            type: 'SEQUENCE',
            value: [
                { type: 'INTEGER', value: 5n },
                { type: 'NULL', value: null }
            ]
        });
    });

    await it('should parse a SET', () => {
        const buffer = Buffer.from([
            0x31, 0x06, // SET: 6 bytes
            0x02, 0x01, 0x05, // INTEGER: 5
            0x05, 0x00 // NULL
        ]);
        const result = parseDER(buffer);
        deepStrictEqual(result, {
            type: 'SET',
            value: new Set([
                { type: 'INTEGER', value: 5n },
                { type: 'NULL', value: null }
            ])
        });
    });

    await it('should parse a NumericString', () => {
        const buffer = Buffer.from([0x12, 0x03, 0x31, 0x32, 0x33]); // NumericString: "123"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'NumericString', value: '123' });
    });

    await it('should parse a PrintableString', () => {
        const buffer = Buffer.from([0x13, 0x03, 0x48, 0x65, 0x6c]); // PrintableString: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'PrintableString', value: 'Hel' });
    });

    await it('should parse a TeletexString', () => {
        const buffer = Buffer.from([0x14, 0x03, 0x48, 0x65, 0x6c]); // TeletexString: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'TeletexString', value: 'Hel' });
    });

    await it('should parse a VideotexString', () => {
        const buffer = Buffer.from([0x15, 0x03, 0x48, 0x65, 0x6c]); // VideotexString: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'VideotexString', value: 'Hel' });
    });

    await it('should parse an IA5String', () => {
        const buffer = Buffer.from([0x16, 0x03, 0x48, 0x65, 0x6c]); // IA5String: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'IA5String', value: 'Hel' });
    });

    await it('should parse an UTCTime', () => {
        const buffer = Buffer.from([0x17, 0x0d, 0x32, 0x32, 0x30, 0x31, 0x30, 0x31, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x5a]); // UTCTime: 2022-01-01T00:00:00Z
        const result = parseDER(buffer);
        deepStrictEqual(result, {
            type: 'UTCTime',
            value: new Date('2022-01-01T00:00:00Z')
        });
    });

    await it('should parse a GeneralizedTime', () => {
        const buffer = Buffer.from([0x18, 0x0f, 0x32, 0x30, 0x32, 0x32, 0x30, 0x31, 0x30, 0x31, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x5a]); // GeneralizedTime: 2022-01-01T00:00:00Z
        const result = parseDER(buffer);
        deepStrictEqual(result, {
            type: 'GeneralizedTime',
            value: new Date('2022-01-01T00:00:00Z')
        });
    });

    await it('should parse a GraphicString', () => {
        const buffer = Buffer.from([0x19, 0x03, 0x48, 0x65, 0x6c]); // GraphicString: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'GraphicString', value: 'Hel' });
    });

    await it('should parse a VisibleString', () => {
        const buffer = Buffer.from([0x1a, 0x03, 0x48, 0x65, 0x6c]); // VisibleString: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'VisibleString', value: 'Hel' });
    });

    await it('should parse a GeneralString', () => {
        const buffer = Buffer.from([0x1b, 0x03, 0x48, 0x65, 0x6c]); // GeneralString: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'GeneralString', value: 'Hel' });
    });

    await it('should parse an UniversalString', () => {
        const buffer = Buffer.from([0x1C, 0x04, 0x00, 0x01, 0x02, 0xC8]); // UniversalString: "C"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'UniversalString', value: String.fromCodePoint(0x000102C8) });
    });

    await it('should parse a CHARACTER STRING', () => {
        const buffer = Buffer.from([0x1d, 0x08, 0x00, 0x00, 0x00, 0x48, 0x00, 0x00, 0x00, 0x65]); // CHARACTER STRING: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'CHARACTER STRING', value: Buffer.from([0x00, 0x00, 0x00, 0x48, 0x00, 0x00, 0x00, 0x65]) });
    });

    await it('should parse a BMPString', () => {
        const buffer = Buffer.from([0x1E, 0x02, 0x03, 0xA3]); // BMPString: "Σ"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'BMPString', value: 'Σ' });
    });

    await it('should parse a DATE', () => {
        const buffer = Buffer.from([0x1F, 0x08, 0x32, 0x30, 0x31, 0x32, 0x31, 0x32, 0x32, 0x31]); // DATE: 2012-12-21
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'DATE', value: { year: 2012, month: 12, day: 21 } });
    });

    await it('should parse a TIME-OF-DAY', () => {
        const buffer = Buffer.from([0x20, 0x0f, 0x31, 0x32, 0x3a, 0x30, 0x30, 0x3a, 0x30, 0x30, 0x5a]); // TIME-OF-DAY: 12:00:00
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'TIME-OF-DAY', value: { hours: 12, minutes: 0, seconds: 0 } });
    });

    await it('should parse a DATE-TIME', () => {
        const buffer = Buffer.from([0x21, 0x0E, 0x31, 0x39, 0x35, 0x31, 0x31, 0x30, 0x31, 0x34, 0x31, 0x35, 0x33, 0x30, 0x30, 0x30]); // DATE-TIME: 1951-10-14T15:30:00|
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'DATE-TIME', value: { year: 1951, month: 10, day: 14, hours: 15, minutes: 30, seconds: 0 } });
    });

    await it('should parse a DURATION', () => {
        const buffer = Buffer.from([0x22, 0x12, 0x32, 0x59, 0x31, 0x30, 0x4D, 0x31, 0x35, 0x44, 0x54, 0x31, 0x30, 0x48, 0x32, 0x30, 0x4D, 0x33, 0x30, 0x53]); // DURATION: P2Y10M15DT10H20M30S
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'DURATION', value: { years: 2, months: 10, days: 15, hours: 10, minutes: 20, seconds: 30 } });
    });

    await it('should parse an Application class tag', () => {
        const buffer = Buffer.from([0x40, 0x03, 0x48, 0x65, 0x6c]); // Application class tag: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'Application', id: 0x40, value: Buffer.from([0x48, 0x65, 0x6c]) });
    });

    await it('should parse a ContextSpecific class tag', () => {
        const buffer = Buffer.from([0x80, 0x03, 0x48, 0x65, 0x6c]); // ContextSpecific class tag: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'ContextSpecific', id: 0x80, value: Buffer.from([0x48, 0x65, 0x6c]) });
    });

    await it('should parse a Private class tag', () => {
        const buffer = Buffer.from([0xC0, 0x03, 0x48, 0x65, 0x6c]); // Private class tag: "Hel"
        const result = parseDER(buffer);
        deepStrictEqual(result, { type: 'Private', id: 0xC0, value: Buffer.from([0x48, 0x65, 0x6c]) });
    });

    await it('should parse an EC public key', () => {
        const pubKey = createPublicKey({ 'format': 'pem', key: ecPublicKey });
        const parsed = ecPublicKeyToRaw(pubKey);
        ok(parsed);
    });

    await it('should parse an EC private key', () => {
        const privKey = createPrivateKey({ 'format': 'pem', key: ecPrivateKey });
        const parsed = ecPrivateKeyToRaw(privKey);
        ok(parsed);
    });

    await it('should compute the shared secret from EC keys', () => {
        const pubKey = createPublicKey({ 'format': 'pem', key: ecPublicKey });
        const privKey = createPrivateKey({ 'format': 'pem', key: ecPrivateKey });

        doesNotThrow(() => ECDH.deriveSharedSecret(<ECPrivateKey> privKey.export({ format: 'jwk' }), <ECPublicKey> pubKey.export({ format: 'jwk' })));
    });
});
