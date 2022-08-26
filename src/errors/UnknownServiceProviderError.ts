export default class UnknownServiceProviderError extends Error {
    name: string = 'UnknownServiceProviderError';

    constructor(serviceName: string) {
        super(`Unknown service provider: ${serviceName}`);
    }
}
