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

export type CORSConfig = {
    origin?: string;
    methods?: string;
    headers?: string;
    maxAge?: number;
    openerPolicy?: 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';
    embedderPolicy?: 'unsafe-none' | 'require-corp';
};

export abstract class CORSConfigProvider extends ConfigProvider<CORSConfig> {
    static config = 'midori::CORS';
}

export default function CORSConfigProviderFactory(options: CORSConfig): Constructor<CORSConfigProvider> & { [K in keyof typeof CORSConfigProvider]: typeof CORSConfigProvider[K] } {
    return class extends CORSConfigProvider {
        register(app: Application): CORSConfig {
            return options;
        }
    };
};
