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

import { appendFileSync } from "node:fs";
import { join } from 'node:path';

import { LogLevel, type LogMessage } from "./Logger.js";
import LogAdapter from "./LogAdapter.js";

/**
 * Provides a log adapter that appends to a file.
 */
export default class FileLogAdapter extends LogAdapter {
    #logFile: string;

    constructor(logDirectory: string, minLevel: LogLevel = LogLevel.INFO) {
        super(minLevel);

        this.#logFile = join(logDirectory, `${new Date().toISOString().replace(/:/g, '-')}.log`);
    }

    override log({ level, message, pid, source, timestamp, exception, ...extra }: LogMessage): void {
        const logDate = timestamp.toISOString();
        const logLevel = LogLevel[level];

        appendFileSync(this.#logFile, `[${logDate}] [${logLevel}] ${message}` + (exception ? '\n' + exception.stack : ''));
    }
}
