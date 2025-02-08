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

import { type ANSIOptions, Color, format } from "../util/ansi.js";
import LogAdapter from "./LogAdapter.js";
import { LogLevel, type LogMessage } from "./Logger.js";

/**
 * Provides a log adapter that prints to the console.
 */
export default class ConsoleLogAdapter extends LogAdapter {
    #formattingEnabled: boolean;

    constructor(minLevel: LogLevel = LogLevel.INFO, formattingEnabled = true) {
        super(minLevel);

        this.#formattingEnabled = formattingEnabled;
    }

    get formattingEnabled(): boolean {
        return this.#formattingEnabled;
    }

    override log({ level, message, pid, source, timestamp, exception, formatting, ...extra }: LogMessage): void {
        let logDate = `${timestamp.toISOString()}`;
        let logLevel = `${LogLevel[level]}`;
        let logMessage = message;
        const fn = level > LogLevel.WARNING ? console.log : console.error;

        if (this.formattingEnabled) {
            logDate = format(logDate, ConsoleLogAdapter.dateFormat);
            logLevel = format(logLevel, ConsoleLogAdapter.levelToFormat(level));
            logMessage = format(message, formatting);
        }

        fn(`[${logDate}] [${logLevel}] ${logMessage}${exception ? '\n' + exception.stack : ''}`);
    }

    static dateFormat: ANSIOptions = {
        color: {
            fg: Color.BLACK,
        },
        bold: true,
    };

    static levelToFormat(level: LogLevel): ANSIOptions {
        switch (level) {
            case LogLevel.DEBUG:
                return {
                    color: {
                        fg: Color.BLACK,
                    },
                    bold: true,
                };
            case LogLevel.INFO:
                return {
                    color: {
                        fg: Color.GREEN,
                    },
                    bold: true,
                };
            case LogLevel.NOTICE:
                return {
                    color: {
                        fg: Color.BLUE,
                    },
                    bold: true,
                };
            case LogLevel.WARNING:
                return {
                    color: {
                        fg: Color.YELLOW,
                    },
                };
            case LogLevel.ERROR:
                return {
                    color: {
                        fg: Color.RED,
                    },
                };
            case LogLevel.CRITICAL:
                return {
                    color: {
                        fg: Color.MAGENTA,
                    },
                };
            case LogLevel.ALERT:
                return {
                    color: {
                        fg: Color.YELLOW,
                    },
                    bold: true,
                };
            case LogLevel.EMERGENCY:
                return {
                    color: {
                        fg: Color.RED,
                    },
                    bold: true,
                };
        }
    }
}
