import { createSign, createVerify, KeyObject, constants } from "crypto";

export default class RSAPSS {
    static sign(shaVersion: 256 | 384 | 512, privateKey: KeyObject, data: Buffer): Buffer {
        const sign = createSign('RSA-SHA' + shaVersion);
        sign.update(data);
        return sign.sign({
            key: privateKey,
            padding: constants.RSA_PKCS1_PSS_PADDING,
            saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
        });
    }

    static verify(shaVersion: 256 | 384 | 512, publicKey: KeyObject, data: Buffer, signature: Buffer): boolean {
        const verify = createVerify('RSA-SHA' + shaVersion);
        verify.update(data);
        return verify.verify( {
            key: publicKey,
            padding: constants.RSA_PKCS1_PSS_PADDING,
            saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
        }, signature);
    }
}
