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

export enum ContentSecurityPolicyValue {
    NONE = "'none'",
    SELF = "'self'",
    STRICT_DYNAMIC = "'strict-dynamic'",
    REPORT_SAMPLE = "'report-sample'",
    UNSAFE_INLINE = "'unsafe-inline'",
    UNSAFE_EVAL = "'unsafe-eval'",
    UNSAFE_HASHES = "'unsafe-hashes'",
    UNSAFE_ALLOW_REDIRECTS = "'unsafe-allow-redirects'",
    ANY = "*",
}

export type ContentSecurityPolicyConfig = {
    connect?: string;
    default?: string;
    font?: string;
    frame?: string;
    img?: string;
    manifest?: string;
    media?: string;
    object?: string;
    prefetch?: string;
    script?: string;
    scriptElem?: string;
    scriptAttr?: string;
    style?: string;
    styleElem?: string;
    styleAttr?: string;
    worker?: string;
};

export abstract class ContentSecurityPolicyConfigProvider extends ConfigProvider<ContentSecurityPolicyConfig> {
    static config: symbol = Symbol('midori::ContentSecurityPolicy');
}

export default function ContentSecurityPolicyConfigProviderFactory(options: ContentSecurityPolicyConfig): Constructor<ContentSecurityPolicyConfigProvider> & { [K in keyof typeof ContentSecurityPolicyConfigProvider]: typeof ContentSecurityPolicyConfigProvider[K] } {
    return class extends ContentSecurityPolicyConfigProvider {
        override register(app: Application): ContentSecurityPolicyConfig {
            return options;
        }
    };
};
