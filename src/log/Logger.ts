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

import { type ANSIOptions, Color } from "../util/ansi.js";

/**
 * Log levels.
 */
export enum LogLevel {
    DEBUG,
    INFO,
    NOTICE,
    WARNING,
    ERROR,
    CRITICAL,
    ALERT,
    EMERGENCY
};

/**
 * Logger options.
 */
export type LogOptions = {
    /** Context to be appended to the log message. */
    context?: unknown;
    /** Separator to be used between the log message and the context. */
    separator?: string;
    /** ANSI options to be used in the message part of the log. */
    format?: ANSIOptions;
};

export type LoggerOptions = {
    /** Whether to enable ANSI formatting. */
    formattingEnabled?: boolean;
    /** Minimum log level to be logged. */
    minLevel?: LogLevel;
};

/**
 * Basic Logger Service Provider.
 */
export default abstract class Logger {
    #formattingEnabled: boolean;
    #minLevel: LogLevel;

    constructor(options?: LoggerOptions) {
        this.#formattingEnabled = options?.formattingEnabled ?? false;
        this.#minLevel = options?.minLevel ?? LogLevel.INFO;
    }

    emergency(message: string, options?: LogOptions): void {
        this.log(LogLevel.EMERGENCY, message, options);
    }

    alert(message: string, options?: LogOptions): void {
        this.log(LogLevel.ALERT, message, options);
    }

    critical(message: string, options?: LogOptions): void {
        this.log(LogLevel.CRITICAL, message, options);
    }

    error(message: string, options?: LogOptions): void {
        this.log(LogLevel.ERROR, message, options);
    }

    warning(message: string, options?: LogOptions): void {
        this.log(LogLevel.WARNING, message, options);
    }

    notice(message: string, options?: LogOptions): void {
        this.log(LogLevel.NOTICE, message, options);
    }

    info(message: string, options?: LogOptions): void {
        this.log(LogLevel.INFO, message, options);
    }

    debug(message: string, options?: LogOptions): void {
        this.log(LogLevel.DEBUG, message, options);
    }

    /**
     * Base log method. All other log methods call this method.
     */
    abstract log(level: LogLevel, message: string, options?: LogOptions): void;

    get minLevel(): LogLevel {
        return this.#minLevel;
    }

    get formattingEnabled(): boolean {
        return this.#formattingEnabled;
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
