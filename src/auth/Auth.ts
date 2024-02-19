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

import Request from "../http/Request.js";
import User from "./User.js";
import UserService from "./UserService.js";

export default class Auth {
    #userService: UserService;

    static UserKey: symbol = Symbol('::user');

    constructor(userService: UserService) {
        this.#userService = userService;
    }

    async authenticateById(req: Request, id: unknown): Promise<User> {
        const user = await this.#userService.getUserById(id);
        if (user === null) {
            throw new Error('Invalid User.');
        }

        req.container.set(Auth.UserKey, user);

        return user;
    }

    async authenticate(req: Request, username: string, password: string): Promise<User> {
        const user = await this.attempt(username, password);
        if (user === null) {
            throw new Error('Invalid credentials.');
        }

        req.container.set(Auth.UserKey, user);

        return user;
    }

    async attempt(username: string, password: string): Promise<User | null> {
        return await this.#userService.getUserByCredentials(username, password);
    }

    check(req: Request): boolean {
        return this.user(req) !== null;
    }

    user(req: Request): User | null {
        return req.container.get(Auth.UserKey) as User ?? null;
    }

    id(req: Request): unknown | null {
        return this.user(req)?.id ?? null;
    }
}
