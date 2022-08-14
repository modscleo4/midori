import { createSign, createVerify, KeyObject } from "crypto";

export default class RSA {
    static sign(shaVersion: 256 | 384 | 512, privateKey: KeyObject, data: Buffer): Buffer {
        const sign = createSign('RSA-SHA' + shaVersion);
        sign.update(data);
        return sign.sign(privateKey);
    }

    static verify(shaVersion: 256 | 384 | 512, publicKey: KeyObject, data: Buffer, signature: Buffer): boolean {
        const verify = createVerify('RSA-SHA' + shaVersion);
        verify.update(data);
        return verify.verify(publicKey, signature);
    }
}
