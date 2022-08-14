import { createSign, createVerify, KeyObject } from "node:crypto";

export default class ECDSA {
    static sign(shaVersion: 256 | 384 | 512, privateKey: KeyObject, data: Buffer): Buffer {
        const sign = createSign('SHA' + shaVersion);
        sign.update(data);
        return sign.sign({
            key: privateKey,
            dsaEncoding: "ieee-p1363"
        });
    }

    static verify(shaVersion: 256 | 384 | 512, publicKey: KeyObject, data: Buffer, signature: Buffer): boolean {
        const verify = createVerify('SHA' + shaVersion);
        verify.update(data);
        return verify.verify({
            key: publicKey,
            dsaEncoding: "ieee-p1363"
        }, signature);
    }
}
