import Logger, { LogLevel } from "./Logger.js";

export default class ConsoleLogger extends Logger {
    log(level: LogLevel, message: string, context?: any): void {
        if (level < this.minLevel) {
            return;
        }

        const logMessage = `${LogLevel[level]}: ${message}`;
        const fn = level < LogLevel.WARNING ? console.log : console.error;

        if (context !== undefined) {
            fn(logMessage, context);
        } else {
            fn(logMessage);
        }
    }
}
