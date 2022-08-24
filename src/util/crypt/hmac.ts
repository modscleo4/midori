import { createHmac } from "crypto";

export default class HMAC {
    static sign(shaVersion: 256 | 384 | 512, secret: string, data: Buffer): Buffer {
        const hmac = createHmac('sha' + shaVersion, secret);
        hmac.update(data);
        return hmac.digest();
    }

    static verify(shaVersion: 256 | 384 | 512, secret: string, data: Buffer, signature: Buffer): boolean {
        const hmac = createHmac('sha' + shaVersion, secret);
        hmac.update(data);
        return Buffer.compare(hmac.digest(), signature) === 0;
    }
}
