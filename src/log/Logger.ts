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

import { ANSIOptions } from "../util/ansi.js";
import { parseStack } from "../util/error.js";
import LogAdapter from "./LogAdapter.js";

/**
 * Log levels.
 */
export enum LogLevel {
    EMERGENCY,
    ALERT,
    CRITICAL,
    ERROR,
    WARNING,
    NOTICE,
    INFO,
    DEBUG,
};

export type LogMessage = {
    /** Log level */
    level: LogLevel;
    /** Log message */
    message: string;
    /** Log timestamp */
    timestamp: Date;
    /** Process ID */
    pid: number;
    /** Source data */
    source: {
        /** Function name */
        method: string;
        /** File path */
        file: string;
        /** Line number */
        line: number;
        /** Column number */
        column: number;
    };
    /** Exception information */
    exception?: Error;
    /** Formatting options */
    formatting?: ANSIOptions;
    /** Context */
    [key: string]: unknown;
};

export type LoggerOptions = {
    /* Log adapters to be used. */
    adapters?: LogAdapter[];
    /* Extra options to be used in the logger. */
    extra?: Record<string, unknown>;
};

/**
 * Basic Logger Service.
 */
export default class Logger {
    #extra: Record<string, unknown>;
    #adapters: LogAdapter[];

    constructor(options?: LoggerOptions) {
        this.#adapters = options?.adapters ?? [];
        this.#extra = options?.extra ?? {};
    }

    emergency(message: string, exception?: Error, formatting?: ANSIOptions): void {
        this.log(LogLevel.EMERGENCY, message, exception);
    }

    alert(message: string, exception?: Error, formatting?: ANSIOptions): void {
        this.log(LogLevel.ALERT, message, exception);
    }

    critical(message: string, exception?: Error, formatting?: ANSIOptions): void {
        this.log(LogLevel.CRITICAL, message, exception);
    }

    error(message: string, exception?: Error, formatting?: ANSIOptions): void {
        this.log(LogLevel.ERROR, message, exception);
    }

    warning(message: string, exception?: Error, formatting?: ANSIOptions): void {
        this.log(LogLevel.WARNING, message, exception);
    }

    notice(message: string, exception?: Error, formatting?: ANSIOptions): void {
        this.log(LogLevel.NOTICE, message, exception);
    }

    info(message: string, exception?: Error, formatting?: ANSIOptions): void {
        this.log(LogLevel.INFO, message, exception);
    }

    debug(message: string, exception?: Error, formatting?: ANSIOptions): void {
        this.log(LogLevel.DEBUG, message, exception);
    }

    /**
     * Base log method. All other log methods call this method.
     */
    log(level: LogLevel, message: string, exception?: Error, formatting?: ANSIOptions): void {
        for (const adapter of this.#adapters) {
            if (level < adapter.minLevel) {
                continue;
            }

            const source = parseStack(new Error())[0];

            adapter.log({
                level,
                message,
                timestamp: new Date(),
                pid: process.pid,
                source,
                exception,
                ...this.#extra,
            });
        }
    }
}
