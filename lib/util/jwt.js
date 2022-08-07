import crypto from 'crypto';

/**
 * @typedef {Object} Header
 * @property {string} alg
 * @property {string} typ
 */

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
    /** @type {Header} */
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

/**
 *
 * @param {string} token
 * @return {boolean}
 */
export function validateJWT(token) {
    const [headerBase64, payloadBase64, signature] = token.split('.');

    /** @type {Header} */
    const header = JSON.parse(Buffer.from(headerBase64, 'base64url').toString('utf8'));

    if (!(typeof header === 'object' && header.hasOwnProperty('alg') && header.hasOwnProperty('typ'))) {
        return false;
    }

    if (!['HS256'].includes(header.alg)) {
        return false;
    }

    const secret = process.env.JWT_SECRET ?? 'secret';

    const hmac = crypto.createHmac("sha256", secret);

    const computedSignature = hmac.update(headerBase64 + '.' + payloadBase64).digest('base64url');

    return computedSignature === signature;
}
