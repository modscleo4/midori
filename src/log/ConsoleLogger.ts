import Logger, { LogLevel, LogOptions } from "./Logger.js";

export default class ConsoleLogger extends Logger {
    log(level: LogLevel, message: string, options?: LogOptions): void {
        if (level < this.minLevel) {
            return;
        }

        let logMessage = `[${new Date().toISOString()}] [${LogLevel[level]}] ${message}`;
        const fn = level < LogLevel.WARNING ? console.log : console.error;

        if (options?.bgColor) {
            logMessage = `\x1b[${(options.bgColor + 40) + (options.bgColor >= 100 ? ';1' : '')}m${logMessage}\x1b[0m`;
        }

        if (options?.fgColor) {
            logMessage = `\x1b[${(options.fgColor + 30) + (options.fgColor >= 100 ? ';1' : '')}m${logMessage}\x1b[0m`;
        }

        if (options?.context !== undefined) {
            fn(logMessage, options?.context);
        } else {
            fn(logMessage);
        }
    }
}
