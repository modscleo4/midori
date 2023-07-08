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
    sign?: {
        alg: string;
        secret?: string;
        privateKeyFile?: string;
    };
    encrypt?: {
        alg: string;
        enc: string;
        secret?: string;
        privateKeyFile?: string;
    };
};

export abstract class JWTConfigProvider extends ConfigProvider<JWTConfig> {
    static config = 'midori::JWT';
}

export default function JWTConfigProviderFactory(options: JWTConfig): Constructor<JWTConfigProvider> & { [K in keyof typeof JWTConfigProvider]: typeof JWTConfigProvider[K] } {
    return class extends JWTConfigProvider {
        register(app: Application): JWTConfig {
            return options;
        }
    };
};
