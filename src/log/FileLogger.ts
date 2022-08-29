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

import { appendFileSync } from "fs";
import Logger, { LoggerOptions, LogLevel, LogOptions } from "./Logger.js";

/**
 * Provides a logger that prints to the console.
 */
export default class ConsoleLogger extends Logger {
    #file: string;

    constructor(options: LoggerOptions & { file: string }) {
        super(options);

        this.#file = options.file;
    }

    log(level: LogLevel, message: string, options?: LogOptions): void {
        if (level < this.minLevel) {
            return;
        }

        let logMessage = `[${new Date().toISOString()}] [${LogLevel[level]}] ${message}`;

        appendFileSync(this.#file, logMessage + (options?.context !== undefined ? '\n\tContext: ' + JSON.stringify(options.context) : ''));
    }
}
