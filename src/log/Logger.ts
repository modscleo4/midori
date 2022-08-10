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

export default abstract class Logger {
    #minLevel: LogLevel = LogLevel.INFO;

    constructor(minLevel: LogLevel = LogLevel.INFO) {
        this.#minLevel = minLevel;
    }

    emergency(message: string, context?: any): void {
        this.log(LogLevel.EMERGENCY, message, context);
    }

    alert(message: string, context?: any): void {
        this.log(LogLevel.ALERT, message, context);
    }

    critical(message: string, context?: any): void {
        this.log(LogLevel.CRITICAL, message, context);
    }

    error(message: string, context?: any): void {
        this.log(LogLevel.ERROR, message, context);
    }

    warning(message: string, context?: any): void {
        this.log(LogLevel.WARNING, message, context);
    }

    notice(message: string, context?: any): void {
        this.log(LogLevel.NOTICE, message, context);
    }

    info(message: string, context?: any): void {
        this.log(LogLevel.INFO, message, context);
    }

    debug(message: string, context?: any): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    abstract log(level: LogLevel, message: string, context?: any): void;

    get minLevel(): LogLevel {
        return this.#minLevel;
    }
}
