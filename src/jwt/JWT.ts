import { readFileSync } from "fs";
import { generateJWT, validateJWT, JWTAlgorithm, Payload } from "../util/jwt.js";

export default class JWT {
    #alg: JWTAlgorithm;
    #secretOrPrivateKey: string = 'secret';

    constructor(_alg: string, _secret: string, publicKeyFile?: string, privateKeyFile?: string) {
        const alg = JWTAlgorithm[_alg as keyof typeof JWTAlgorithm];
        const secret = _secret || 'secret';
        const publicKey = publicKeyFile ? readFileSync(publicKeyFile, { encoding: 'utf8' }) : undefined;
        const privateKey = privateKeyFile ? readFileSync(privateKeyFile, { encoding: 'utf8' }) : undefined;

        this.#alg = alg;
        this.#secretOrPrivateKey = ([JWTAlgorithm.HS256, JWTAlgorithm.HS384, JWTAlgorithm.HS512].includes(alg) ? secret : privateKey) || 'secret';
    }

    sign(payload: Payload): string {
        return generateJWT(payload, this.#alg, this.#secretOrPrivateKey);
    }

    verify(token: string): boolean {
        return validateJWT(token, this.#secretOrPrivateKey);
    }
}
