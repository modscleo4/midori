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
import type { Application } from "../app/Server.js";
import type { Constructor } from "../util/types.js";

export type ErrorConfig = {
    /** Whether to expose errors to the client. */
    exposeErrors?: boolean;
};

export abstract class ErrorConfigProvider extends ConfigProvider<ErrorConfig> {
    static override config: symbol = Symbol('midori::Error');
}

export default function ErrorConfigProviderFactory(options: ErrorConfig): Constructor<ErrorConfigProvider> & { [K in keyof typeof ErrorConfigProvider]: typeof ErrorConfigProvider[K] } {
    return class extends ErrorConfigProvider {
        override register(app: Application): ErrorConfig {
            return options;
        }
    };
};
