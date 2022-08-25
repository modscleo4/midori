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

/**
 * Container is a class that is used to store and retrieve anything.
 * It is designed to be used on the request object.
 */
export default class Container {
    #data = new Map<string, any>();

    #options = {
        throwNotFound: false
    };

    constructor(options?: { throwNotFound?: boolean }) {
        this.#options.throwNotFound = options?.throwNotFound || false;
    }

    /**
     * Get a value from the container.
     */
    get(key: string): any {
        if (!this.has(key) && this.#options.throwNotFound) {
            throw new Error(`Key '${key}' not found in container`);
        }

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
