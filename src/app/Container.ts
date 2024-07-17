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

export class ReadonlyContainer<K, V> {
    #data: Map<K, V>;

    constructor(data?: Iterable<readonly [K, V]>) {
        this.#data = new Map<K, V>(data);
    }

    /**
     * Get a value from the container.
     */
    get(key: K): V | undefined {
        return this.#data.get(key);
    }

    /**
     * Check if a value exists in the container.
     */
    has(key: K): boolean {
        return this.#data.has(key);
    }

    [Symbol.iterator]() {
        return this.#data[Symbol.iterator]();
    }
}

/**
 * Container is a class that is used to store and retrieve anything.
 * It is designed to be used on the Request object.
 */
export default class Container<K, V> {
    #data: Map<K, V>;

    constructor(data?: Iterable<readonly [K, V]>) {
        this.#data = new Map<K, V>(data);
    }

    /**
     * Get a value from the container.
     */
    get(key: K): V | undefined {
        return this.#data.get(key);
    }

    /**
     * Set a value in the container.
     */
    set(key: K, value: V): Container<K, V> {
        this.#data.set(key, value);

        return this;
    }

    /**
     * Delete a value from the container.
     */
    delete(key: K): Container<K, V> {
        this.#data.delete(key);

        return this;
    }

    /**
     * Check if a value exists in the container.
     */
    has(key: K): boolean {
        return this.#data.has(key);
    }

    [Symbol.iterator]() {
        return this.#data[Symbol.iterator]();
    }
}
