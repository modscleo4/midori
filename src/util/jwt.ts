import { createHmac } from 'crypto';

export type Header = {
    alg: string,
    typ: string,
}

export type Payload = {
    sub: string,
    exp: number,
    iat: number,
}

export function generateJWT(payload: Payload): string {
    const header: Header = {
        "alg": "HS256",
        "typ": "JWT"
    };

    const headerBase64 = Buffer.from(JSON.stringify(header)).toString("base64url");
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");

    const secret = process.env.JWT_SECRET ?? 'secret';

    const hmac = createHmac("sha256", secret);

    const signature = hmac.update(headerBase64 + '.' + payloadBase64).digest('base64url');

    return headerBase64 + '.' + payloadBase64 + '.' + signature;
}

export function validateJWT(token: string): boolean {
    const [headerBase64, payloadBase64, signature] = token.split('.');

    const header: Header = JSON.parse(Buffer.from(headerBase64, 'base64url').toString('utf8'));

    if (!(typeof header === 'object' && header.hasOwnProperty('alg') && header.hasOwnProperty('typ'))) {
        return false;
    }

    if (!['HS256'].includes(header.alg)) {
        return false;
    }

    const secret = process.env.JWT_SECRET ?? 'secret';

    const hmac = createHmac("sha256", secret);

    const computedSignature = hmac.update(headerBase64 + '.' + payloadBase64).digest('base64url');

    return computedSignature === signature;
}
