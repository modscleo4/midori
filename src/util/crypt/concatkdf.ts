import { KeyObject, createHash, subtle, webcrypto } from 'node:crypto';
import { encodeUInt32BE } from '../buffer.js';

/**
 * Concatenation Key Derivation Function, as defined in NIST SP 800-56A, section 5.8.1.
 */
export default class ConcatKDF {
    static deriveKey(shaVersion: 1 | 256 | 384 | 512, sharedSecret: Buffer, keyLengthBits: number, otherInfo: Buffer | null): Buffer {
        const digestLengthBits = this.getDigestLengthBits(shaVersion);

        const buffer: Buffer[] = [];

        for (let i = 1; i <= this.computeDigestCycles(digestLengthBits, keyLengthBits); i++) {
            const md = createHash(`sha${shaVersion}`);

            md.update(encodeUInt32BE(i));
            md.update(sharedSecret);

            if (otherInfo) {
                md.update(otherInfo);
            }

            const hash = md.digest();
            buffer.push(hash);
        }

        const derivedKey = Buffer.concat(buffer);
        return derivedKey.subarray(0, keyLengthBits / 8);
    }

    static computeDigestCycles(digestLengthBits: number, keyLengthBits: number): number {
        return (keyLengthBits + digestLengthBits - 1) / digestLengthBits;
    }

    static getDigestLengthBits(shaVersion: 1 | 256 | 384 | 512): number {
        if (shaVersion === 1) {
            return 160;
        }

        return shaVersion;
    }
}
