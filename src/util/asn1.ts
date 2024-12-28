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

import type { KeyObject } from "node:crypto";
import { ISO8601, ISO8601Duration, parseISO8601, parseISO8601Duration } from "./datetime.js";

type DERBoolean = {
    type: 'BOOLEAN';
    value: boolean;
};

type DERInteger = {
    type: 'INTEGER';
    value: bigint;
};

type DERBitString = {
    type: 'BIT STRING';
    value: Buffer;
};

type DEROctetString = {
    type: 'OCTET STRING';
    value: Buffer;
};

type DERNull = {
    type: 'NULL';
    value: null;
};

type DERObjectIdentifier = {
    type: 'OBJECT IDENTIFIER';
    value: string;
};

type DERObjectDescriptor = {
    type: 'ObjectDescriptor';
    value: string;
};

type DERReal = {
    type: 'REAL';
    value: {
        mantissa: number;
        base: number;
        exponent: number;
    };
};

type DEREnumerated = {
    type: 'ENUMERATED';
    value: bigint;
};

type DERUTF8String = {
    type: 'UTF8String';
    value: string;
};

type DERTime = {
    type: 'TIME';
    value: ISO8601;
};

type DERSequence = {
    type: 'SEQUENCE';
    value: DERValue[];
};

type DERSet = {
    type: 'SET';
    value: Set<DERValue>;
};

type DERPrintableString = {
    type: 'PrintableString';
    value: string;
};

type DERNumericString = {
    type: 'NumericString';
    value: string;
};

type DERTeletexString = {
    type: 'TeletexString';
    value: string;
};

type DERVideotexString = {
    type: 'VideotexString';
    value: string;
};

type DERIA5String = {
    type: 'IA5String';
    value: string;
};

type DERUTCTime = {
    type: 'UTCTime';
    value: Date;
};

type DERGeneralizedTime = {
    type: 'GeneralizedTime';
    value: Date;
};

type DERGraphicString = {
    type: 'GraphicString';
    value: string;
};

type DERVisibleString = {
    type: 'VisibleString';
    value: string;
};

type DERGeneralString = {
    type: 'GeneralString';
    value: string;
};

type DERUniversalString = {
    type: 'UniversalString';
    value: string;
};

type DERCharacterString = {
    type: 'CHARACTER STRING';
    value: Buffer;
};

type DERBMPString = {
    type: 'BMPString';
    value: string;
};

type DERDate = {
    type: 'DATE';
    value: {
        year: number;
        month: number;
        day: number;
    };
};

type DERTimeOfDay = {
    type: 'TIME-OF-DAY';
    value: {
        hours: number;
        minutes: number;
        seconds: number;
    };
};

type DERDateTime = {
    type: 'DATE-TIME';
    value: {
        year: number;
        month: number;
        day: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
};

type DERDuration = {
    type: 'DURATION';
    value: ISO8601Duration;
};

type DERApplication = {
    type: 'Application';
    id: number;
    value: Buffer;
};

type DERContextSpecific = {
    type: 'ContextSpecific';
    id: number;
    value: Buffer;
};

type DERPrivate = {
    type: 'Private';
    id: number;
    value: Buffer;
};

export type DERValue = DERBoolean
    | DERInteger
    | DERBitString
    | DEROctetString
    | DERNull
    | DERObjectIdentifier
    | DERObjectDescriptor
    | DERReal
    | DEREnumerated
    | DERUTF8String
    | DERTime
    | DERSequence
    | DERSet
    | DERNumericString
    | DERPrintableString
    | DERTeletexString
    | DERVideotexString
    | DERIA5String
    | DERUTCTime
    | DERGeneralizedTime
    | DERGraphicString
    | DERVisibleString
    | DERGeneralString
    | DERUniversalString
    | DERCharacterString
    | DERBMPString
    | DERDate
    | DERTimeOfDay
    | DERDateTime
    | DERDuration
    | DERApplication
    | DERContextSpecific
    | DERPrivate;

export function parseDER(buffer: Buffer, getLength?: (length: number) => void): DERValue {
    let offset = 0;

    function readByte(): number {
        return buffer[offset++];
    }

    function readLength(): number {
        let length = readByte();
        if (length & 0x80) {
            const numBytes = length & 0x7F;
            length = 0;
            for (let i = 0; i < numBytes; i++) {
                length = (length << 8) | readByte();
            }
        }

        return length;
    }

    function parseValue(type: number, length: number): DERValue {
        const valueBuffer = buffer.subarray(offset, offset + length);
        offset += length;

        if (type >= 0b01000000 && type <= 0b01111111) {
            // Application class tags
            return {
                type: 'Application',
                id: type,
                value: valueBuffer,
            };
        }

        if (type >= 0b10000000 && type <= 0b10111111) {
            // Context-specific class tags
            return {
                type: 'ContextSpecific',
                id: type,
                value: valueBuffer,
            };
        }

        if (type >= 0b11000000 && type <= 0b11111111) {
            // Private class tags
            return {
                type: 'Private',
                id: type,
                value: valueBuffer,
            };
        }

        switch (type) {
            case 0x01: // BOOLEAN
                return { type: 'BOOLEAN', value: valueBuffer[0] !== 0x00 };
            case 0x02: // INTEGER
                return { type: 'INTEGER', value: BigInt(`0x${valueBuffer.toString('hex')}`) };
            case 0x03: // BIT STRING
                return { type: 'BIT STRING', value: valueBuffer.subarray(1) }; // Skip unused bits byte
            case 0x04: // OCTET STRING
                return { type: 'OCTET STRING', value: valueBuffer };
            case 0x05: // NULL
                return { type: 'NULL', value: null };
            case 0x06: // OBJECT IDENTIFIER
                return { type: 'OBJECT IDENTIFIER', value: parseOID(valueBuffer) };
            case 0x07: // ObjectDescriptor
                return { type: 'ObjectDescriptor', value: valueBuffer.toString('ascii') };
            case 0x09: // REAL
                return { type: 'REAL', value: parseReal(valueBuffer) };
            case 0x0A: // ENUMERATED
                return { type: 'ENUMERATED', value: BigInt(`0x${valueBuffer.toString('hex')}`) };
            case 0x0C: // UTF8String
                return { type: 'UTF8String', value: valueBuffer.toString('utf8') };
            case 0x0D: // TIME
                // Parse ISO 8601 Time
                return { type: 'TIME', value: parseISO8601(valueBuffer.toString('ascii')) };
            case 0x10: // SEQUENCE
            case 0x30: // Alternative encoding for SEQUENCE
                return { type: 'SEQUENCE', value: parseSequence(valueBuffer) };
            case 0x11: // SET
            case 0x31: // Alternative encoding for SET
                return { type: 'SET', value: new Set(parseSequence(valueBuffer)) };
            case 0x13: // PrintableString
                return { type: 'PrintableString', value: valueBuffer.toString('ascii') };
            case 0x12: // NumericString
                return { type: 'NumericString', value: valueBuffer.toString('ascii') };
            case 0x14: // TeletexString
                return { type: 'TeletexString', value: valueBuffer.toString('ascii') };
            case 0x15: // VideotexString
                return { type: 'VideotexString', value: valueBuffer.toString('ascii') };
            case 0x16: // IA5String
                return { type: 'IA5String', value: valueBuffer.toString('ascii') };
            case 0x17: // UTCTime
                return { type: 'UTCTime', value: parseUTCTime(valueBuffer) };
            case 0x18: // GeneralizedTime
                return { type: 'GeneralizedTime', value: parseGeneralizedTime(valueBuffer) };
            case 0x19: // GraphicString
                return { type: 'GraphicString', value: valueBuffer.toString('ascii') };
            case 0x1A: // VisibleString
                return { type: 'VisibleString', value: valueBuffer.toString('ascii') };
            case 0x1B: // GeneralString
                return { type: 'GeneralString', value: valueBuffer.toString('ascii') };
            case 0x1C: // UniversalString
                return { type: 'UniversalString', value: parseUCSString(valueBuffer) };
            case 0x1D: // CHARACTER STRING
                return { type: 'CHARACTER STRING', value: valueBuffer };
            case 0x1E: // BMPString
                return { type: 'BMPString', value: new TextDecoder('utf-16be').decode(valueBuffer) };
            case 0x1F: { // DATE
                const dateStr = valueBuffer.toString('ascii');
                return {
                    type: 'DATE',
                    value: {
                        year: parseInt(dateStr.slice(0, 4)),
                        month: parseInt(dateStr.slice(4, 6)),
                        day: parseInt(dateStr.slice(6, 8)),
                    },
                };
            }
            case 0x20: { // TIME-OF-DAY
                const timeOfDayStr = valueBuffer.toString('ascii');
                return {
                    type: 'TIME-OF-DAY',
                    value: {
                        hours: parseInt(timeOfDayStr.slice(0, 2)),
                        minutes: parseInt(timeOfDayStr.slice(3, 5)),
                        seconds: parseInt(timeOfDayStr.slice(6, 8)),
                    },
                };
            }
            case 0x21: { // DATE-TIME
                const year = parseInt(valueBuffer.subarray(0, 4).toString('ascii'));
                const month = parseInt(valueBuffer.subarray(4, 6).toString('ascii'));
                const day = parseInt(valueBuffer.subarray(6, 8).toString('ascii'));
                const hours = parseInt(valueBuffer.subarray(8, 10).toString('ascii'));
                const minutes = parseInt(valueBuffer.subarray(10, 12).toString('ascii'));
                const seconds = parseInt(valueBuffer.subarray(12, 14).toString('ascii'));
                return {
                    type: 'DATE-TIME',
                    value: {
                        year,
                        month,
                        day,
                        hours,
                        minutes,
                        seconds,
                    }
                };
            }
            case 0x22: // DURATION
                return { type: 'DURATION', value: parseISO8601Duration('P' + valueBuffer.toString('ascii')) as ISO8601Duration };
            default:
                throw new Error(`Unsupported DER type: 0x${type.toString(16)}`);
        }
    }

    function parseOID(buffer: Buffer): string {
        const values = [];
        let value = 0;

        for (let i = 0; i < buffer.length; i++) {
            const byte = buffer[i];
            if (byte & 0x80) {
                value = (value << 7) | (byte & 0x7F);
            } else {
                value = (value << 7) | byte;
                values.push(value);
                value = 0;
            }
        }

        const first = Math.floor(values[0] / 40);
        const second = values[0] % 40;
        values.splice(0, 1, first, second);

        return values.join('.');
    }

    function parseReal(buffer: Buffer): { mantissa: number; base: number; exponent: number; } {
        if (buffer.length === 0) {
            return { mantissa: 0, base: 0, exponent: 0 };
        }

        const firstByte = buffer[0];
        const base = (firstByte & 0x30) === 0x00 ? 2 : (firstByte & 0x30) === 0x10 ? 8 : 16;  // Binary, Octal, Decimal
        const scalingFactor = (firstByte & 0x0C) >> 2;                                        // Scaling factor (optional)
        const isNegative = (firstByte & 0x40) !== 0;                                          // Sign bit
        const exponentLength = firstByte & 0x03;                                              // Number of bytes for exponent

        if (exponentLength + 1 >= buffer.length) {
            throw new Error("Invalid REAL encoding: Insufficient data for exponent.");
        }

        // Decode exponent
        let exponent = 0;
        for (let i = 1; i <= exponentLength; i++) {
            exponent = (exponent << 8) | buffer[i];
        }

        if (exponent & (1 << (8 * exponentLength - 1))) {
            exponent -= (1 << (8 * exponentLength)); // Two's complement for negative exponent
        }

        // Decode mantissa
        const mantissaBytes = buffer.subarray(1 + exponentLength);
        let mantissa = 0;
        for (let i = 0; i < mantissaBytes.length; i++) {
            mantissa = (mantissa << 8) | mantissaBytes[i];
        }

        if (isNegative) {
            mantissa = -mantissa;
        }

        return { mantissa, base, exponent: exponent - scalingFactor };
    }

    function parseSequence(buffer: Buffer): DERValue[] {
        const values: DERValue[] = [];
        let seqOffset = 0;

        while (seqOffset < buffer.length) {
            const seqParser = parseDER(buffer.subarray(seqOffset), len => { seqOffset += len; });
            values.push(seqParser);
        }

        return values;
    }

    function parseUCSString(buffer: Buffer): string {
        let result = '';
        for (let i = 0; i < buffer.length; i += 4) {
            result += String.fromCodePoint(buffer.readUInt32BE(i));
        }

        return result;
    }

    function parseUTCTime(buffer: Buffer): Date {
        const str = buffer.toString('ascii');
        return new Date(`20${str.slice(0, 2)}-${str.slice(2, 4)}-${str.slice(4, 6)}T${str.slice(6, 8)}:${str.slice(8, 10)}:${str.slice(10, 12)}Z`);
    }

    function parseGeneralizedTime(buffer: Buffer): Date {
        const str = buffer.toString('ascii');
        return new Date(`${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}T${str.slice(8, 10)}:${str.slice(10, 12)}:${str.slice(12, 14)}Z`);
    }

    const type = readByte();
    const length = readLength();
    const value = parseValue(type, length);
    getLength?.(offset);

    return value;
}

export function ecPublicKeyToRaw(publicKey: KeyObject): Buffer {
    const der = publicKey.export({ type: 'spki', format: 'der' });

    const parsed = parseDER(der);
    if (!parsed || parsed.type !== 'SEQUENCE') {
        throw new TypeError('Invalid public key');
    }

    const bitString = parsed.value.find(v => v.type === 'BIT STRING');
    if (!bitString) {
        throw new TypeError('Invalid public key');
    }

    return bitString.value;
}

export function ecPrivateKeyToRaw(privateKey: KeyObject): Buffer {
    const der = privateKey.export({ type: 'pkcs8', format: 'der' });

    const parsed = parseDER(der);
    if (!parsed || parsed.type !== 'SEQUENCE') {
        throw new TypeError('Invalid private key');
    }

    const octetString = parsed.value.find(v => v.type === 'OCTET STRING');
    if (!octetString) {
        throw new TypeError('Invalid private key');
    }

    const octetStringParsed = parseDER(octetString.value);
    if (!octetStringParsed || octetStringParsed.type !== 'SEQUENCE') {
        throw new TypeError('Invalid private key');
    }

    const modulus = octetStringParsed.value.find(v => v.type === 'OCTET STRING');
    if (!modulus) {
        throw new TypeError('Invalid private key');
    }

    return modulus.value;
}
