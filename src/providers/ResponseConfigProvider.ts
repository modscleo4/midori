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

export enum CompressionAlgorithm {
    GZIP = 'gzip',
    DEFLATE = 'deflate',
    BROTLI = 'br',
    IDENTITY = 'identity',
};

export type ResponseConfig = {
    /** Response compression configuration. */
    compression?: {
        /** Whether the compression is enabled. */
        enabled?: boolean;
        /** Whether the compression is enabled for the given content types. Use `*​/*` to enable for all content types or `<type>/*` to enable for all subtypes of the given type. */
        contentTypes?: string[];
        /** Default compression algorithm to be used when the client does not specify one. */
        defaultAlgorithm?: CompressionAlgorithm;
        /** Internal compression algorithm priority order (from highest to lowest). Used when the client does not specify a preferred algorithm by the priority order. */
        order?: CompressionAlgorithm[];
        /** Compression level for each algorithm. */
        levels?: Partial<Record<CompressionAlgorithm, number>>;
    };
};

export abstract class ResponseConfigProvider extends ConfigProvider<ResponseConfig> {
    static override config: symbol = Symbol('midori::Response');
}

export default function ResponseConfigProviderFactory(options: ResponseConfig): Constructor<ResponseConfigProvider> & { [K in keyof typeof ResponseConfigProvider]: typeof ResponseConfigProvider[K] } {
    return class extends ResponseConfigProvider {
        override register(app: Application): ResponseConfig {
            return options;
        }
    };
};
