import crypto from 'crypto';

/**
 * @typedef {Object} Payload
 * @property {string} sub
 * @property {number} exp
 * @property {number} iat
 */

/**
 *
 * @param {Payload} payload
 * @return {string}
 */
export function generateJWT(payload) {
    const header = {
        "alg": "HS256",
        "typ": "JWT"
    };

    const headerBase64 = Buffer.from(JSON.stringify(header)).toString("base64url");
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");

    const secret = process.env.JWT_SECRET ?? 'secret';

    const hmac = crypto.createHmac("sha256", secret);

    const signature = hmac.update(headerBase64 + '.' + payloadBase64).digest('base64url');

    return headerBase64 + '.' + payloadBase64 + '.' + signature;
}

export function validateJWT(token) {
    const [headerBase64, payloadBase64, signature] = token.split('.');

    const secret = process.env.JWT_SECRET ?? 'secret';

    const hmac = crypto.createHmac("sha256", secret);

    const computedSignature = hmac.update(headerBase64 + '.' + payloadBase64).digest('base64url');

    return computedSignature === signature;
}
