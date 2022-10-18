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

import { colorizeBackground, colorizeForeground } from "../util/ascii.js";
import Logger, { LogLevel, LogOptions } from "./Logger.js";

/**
 * Provides a logger that prints to the console.
 */
export default class ConsoleLogger extends Logger {
    log(level: LogLevel, message: string, options?: LogOptions): void {
        if (level < this.minLevel) {
            return;
        }

        let logDate = `[${new Date().toISOString()}]`;
        let logLevel = `[${LogLevel[level]}]`;
        let logMessage = `${message}`;
        const fn = level < LogLevel.WARNING ? console.log : console.error;

        if (this.colorsEnabled) {
            const logLevelColor = Logger.levelToColor(level);
            logLevel = colorizeForeground(logLevel, logLevelColor);

            if (options?.bgColor) {
                logMessage = colorizeBackground(logMessage, options.bgColor);
            }

            if (options?.fgColor) {
                logMessage = colorizeForeground(logMessage, options.fgColor);
            }
        }

        if (options?.context !== undefined) {
            fn(`${logDate} ${logLevel} ${logMessage}` + (options?.separator ?? ' ') + options?.context);
        } else {
            fn(`${logDate} ${logLevel} ${logMessage}`);
        }
    }
}
