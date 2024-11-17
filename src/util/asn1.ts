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

type DERUTF8String = {
    type: 'UTF8String';
    value: string;
};

type DERSequence = {
    type: 'SEQUENCE';
    value: DERValue[];
};

type DERSet = {
    type: 'SET';
    value: DERValue[];
};

type DERPrintableString = {
    type: 'PrintableString';
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

type DERValue = DERInteger | DERBitString | DEROctetString | DERNull | DERObjectIdentifier | DERUTF8String | DERSequence | DERSet | DERPrintableString | DERIA5String | DERUTCTime | DERGeneralizedTime;

function parseDER(buffer: Buffer): DERValue {
    const type = buffer.readUInt8(0);
    let length = buffer.readUInt8(1);
    let dataStart = 2;
    if (length & 0x80) {
        const ll = length & 0x7F;
        dataStart += ll;
        length = buffer.readUIntBE(2, ll);
    }

    const value = buffer.subarray(dataStart, dataStart + length);

    switch (type) {
        case 0x02: // INTEGER
            return {
                type: 'INTEGER',
                value: value.readBigInt64BE()
            };
        case 0x03: // BIT STRING
            return {
                type: 'BIT STRING',
                value
            };
        case 0x04: // OCTET STRING
            return {
                type: 'OCTET STRING',
                value
            };
        case 0x05: // NULL
            return {
                type: 'NULL',
                value: null
            };
        case 0x06: // OBJECT IDENTIFIER
            return {
                type: 'OBJECT IDENTIFIER',
                value: value.toString('utf8')
            };
        case 0x0C: // UTF8String
            return {
                type: 'UTF8String',
                value: value.toString('utf8')
            };
        case 0x10: // SEQUENCE
        case 0x30: // SEQUENCE
            return {
                type: 'SEQUENCE',
                value: [parseDER(value)]
            };
        case 0x11: // SET
        case 0x31: // SET
            return {
                type: 'SET',
                value: [parseDER(value)]
            };
        case 0x13: // PrintableString
            return {
                type: 'PrintableString',
                value: value.toString('utf8')
            };
        case 0x16: // IA5String
            return {
                type: 'IA5String',
                value: value.toString('utf8')
            };
        case 0x17: // UTCTime
            return {
                type: 'UTCTime',
                value: new Date(value.toString('utf8'))
            };
        case 0x18: // GeneralizedTime
            return {
                type: 'GeneralizedTime',
                value: new Date(value.toString('utf8'))
            };
    }

    throw new Error(`Unknown type: ${type}`);
}

export function privateKeyToRaw(privateKey: KeyObject): Buffer {
    const der = privateKey.export({ type: 'pkcs8', format: 'der' });

    return der.subarray(36, 36 + 32);
}

export function publicKeyToRaw(publicKey: KeyObject): Buffer {
    const der = publicKey.export({ type: 'spki', format: 'der' });

    return der.subarray(26, 26 + 66);
}
