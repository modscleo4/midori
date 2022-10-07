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
 * Color codes for the console.
 */
export enum LogColor {
    BLACK = 0,
    RED,
    GREEN,
    YELLOW,
    BLUE,
    MAGENTA,
    CYAN,
    WHITE,
    GRAY = 100,
    LIGHT_RED,
    LIGHT_GREEN,
    LIGHT_YELLOW,
    LIGHT_BLUE,
    LIGHT_MAGENTA,
    LIGHT_CYAN,
    LIGHT_WHITE
};

/**
 * Logger options.
 */
export type LogOptions = {
    context?: any;
    separator?: string;
    bgColor?: LogColor;
    fgColor?: LogColor;
};

export type LoggerOptions = {
    colorsEnabled?: boolean;
    minLevel?: LogLevel;
};

/**
 * Basic Logger Service Provider.
 */
export default abstract class Logger {
    #colorsEnabled: boolean;
    #minLevel: LogLevel;

    constructor(options?: LoggerOptions) {
        this.#colorsEnabled = options?.colorsEnabled ?? false;
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

    get colorsEnabled(): boolean {
        return this.#colorsEnabled;
    }
}
