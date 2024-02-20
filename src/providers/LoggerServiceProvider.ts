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

import { Application } from "../app/Server.js";
import ServiceProvider from "../app/ServiceProvider.js";
import Logger from "../log/Logger.js";
import { Constructor } from "../util/types.js";

export abstract class LoggerServiceProvider extends ServiceProvider<Logger> {
    static override service: symbol = Symbol('midori::Logger');
}

export default function LoggerServiceProviderFactory(loggerService: Logger): Constructor<LoggerServiceProvider> & { [K in keyof typeof LoggerServiceProvider]: typeof LoggerServiceProvider[K] } {
    return class extends LoggerServiceProvider {
        override register(app: Application): Logger {
            return loggerService;
        }
    };
}
