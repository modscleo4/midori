import crypto from 'crypto';

export function generateUUID() {
    return crypto.randomUUID();
}
