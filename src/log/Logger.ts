export default abstract class Logger {
    abstract emergency(message: string, context?: any): void;
    abstract alert(message: string, context?: any): void;
    abstract critical(message: string, context?: any): void;
    abstract error(message: string, context?: any): void;
    abstract warning(message: string, context?: any): void;
    abstract notice(message: string, context?: any): void;
    abstract info(message: string, context?: any): void;
    abstract debug(message: string, context?: any): void;
}
