export default class Container {
    #data = new Map<string, any>();

    get(key: string): any {
        return this.#data.get(key);
    }

    set(key: string, value: any): Container {
        this.#data.set(key, value);

        return this;
    }

    has(key: string): boolean {
        return this.#data.has(key);
    }
}
