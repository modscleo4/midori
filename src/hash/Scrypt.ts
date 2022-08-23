import Hash from "./Hash.js";
import { randomBytes, scryptSync } from 'crypto';

export default class Scrypt extends Hash {
    hash(data: string, options?: { salt?: string, cost?: number; }): string {
        const salt = Buffer.from(options?.salt || randomBytes(16).toString('hex'));
        const cost = options?.cost || 10;
        return ['', '2s', cost, salt, scryptSync(data, salt, 64, { N: 1 << (cost) }).toString('hex')].join('$');
    }

    verify(hash: string, data: string): boolean {
        const [, , cost, salt, hashData] = hash.split('$');
        return this.hash(data, { salt, cost: parseInt(cost) }) === hash;
    }
}
