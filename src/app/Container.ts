/**
 * Container is a class that is used to store and retrieve anything.
 * It is designed to be used on the request object.
 */
export default class Container {
    #data = new Map<string, any>();

    /**
     * Get a value from the container.
     */
    get(key: string): any {
        return this.#data.get(key);
    }

    /**
     * Set a value in the container.
     */
    set(key: string, value: any): Container {
        this.#data.set(key, value);

        return this;
    }

    /**
     * Check if a value exists in the container.
     */
    has(key: string): boolean {
        return this.#data.has(key);
    }
}
