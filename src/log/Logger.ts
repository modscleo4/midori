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

export type LogOptions = {
    context?: any;
    bgColor?: LogColor;
    fgColor?: LogColor;
};

export default abstract class Logger {
    #minLevel: LogLevel = LogLevel.INFO;

    constructor(options: { minLevel: LogLevel; } = { minLevel: LogLevel.INFO }) {
        this.#minLevel = options.minLevel;
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
}
