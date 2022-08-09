import Logger from "./Logger.js";

export default class ConsoleLogger extends Logger {
    emergency(message: string, context?: any): void {
        if (context !== undefined) {
            console.error(message, context);
        } else {
            console.error(message);
        }
    }

    alert(message: string, context?: any): void {
        if (context !== undefined) {
            console.error(message, context);
        } else {
            console.error(message);
        }
    }

    critical(message: string, context?: any): void {
        if (context !== undefined) {
            console.error(message, context);
        } else {
            console.error(message);
        }
    }

    error(message: string, context?: any): void {
        if (context !== undefined) {
            console.error(message, context);
        } else {
            console.error(message);
        }
    }

    warning(message: string, context?: any): void {
        if (context !== undefined) {
            console.log(message, context);
        } else {
            console.log(message);
        }
    }

    notice(message: string, context?: any): void {
        if (context !== undefined) {
            console.log(message, context);
        } else {
            console.log(message);
        }
    }

    info(message: string, context?: any): void {
        if (context !== undefined) {
            console.log(message, context);
        } else {
            console.log(message);
        }
    }

    debug(message: string, context?: any): void {
        if (context !== undefined) {
            console.log(message, context);
        } else {
            console.log(message);
        }
    }
}
