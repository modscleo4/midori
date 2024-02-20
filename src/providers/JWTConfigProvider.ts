/**
 * Copyright 2022 Dhiego Cassiano Fogaça Barbosa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ConfigProvider from "../app/ConfigProvider.js";
import { Application } from "../app/Server.js";
import { Constructor } from "../util/types.js";

export type JWTConfig = {
    /** Configuration for signing JWTs (JWS). */
    sign?: {
        /** Algorithm to be used. Possible values: HS256, HS384, HS512, RS256, RS384, RS512, ES256, ES384, ES512, PS256, PS384, PS512. */
        alg: string;
        /** Secret to be used for HS* algorithms. Read as hex-encoded. */
        secret?: string;
        /** Private key file to be used for RS* and PS* algorithms. */
        privateKeyFile?: string;
    };
    /** Configuration for encrypting JWTs (JWE). */
    encrypt?: {
        /** Algorithm to be used. Possible values: RSA1_5, RSA-OAEP, RSA-OAEP-256, A128KW, A192KW, A256KW, dir, ECDH-ES, ECDH-ES+A128KW, ECDH-ES+A192KW, ECDH-ES+A256KW. */
        alg: string;
        /** Encryption algorithm to be used. Possible values: A128CBC-HS256, A192CBC-HS384, A256CBC-HS512, A128GCM, A192GCM, A256GCM. */
        enc: string;
        /** Key to be used for A*KW and dir algorithms. Must be hex-encoded. */
        secret?: string;
        /** Private key file to be used for RSA* and ECDH* algorithms. */
        privateKeyFile?: string;
    };
};

export abstract class JWTConfigProvider extends ConfigProvider<JWTConfig> {
    static override config: symbol = Symbol('midori::JWT');
}

export default function JWTConfigProviderFactory(options: JWTConfig): Constructor<JWTConfigProvider> & { [K in keyof typeof JWTConfigProvider]: typeof JWTConfigProvider[K] } {
    return class extends JWTConfigProvider {
        override register(app: Application): JWTConfig {
            return options;
        }
    };
};
