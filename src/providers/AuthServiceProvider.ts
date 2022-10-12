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

import Server from "../app/Server.js";
import ServiceProvider from "../app/ServiceProvider.js";
import Auth from "../auth/Auth.js";
import UserProvider from "../auth/UserService.js";
import { UserServiceProvider } from "./UserServiceProvider.js";

export default class AuthServiceProvider extends ServiceProvider<Auth> {
    static service: string = 'Auth';

    register(server: Server): Auth {
        const userProvider = server.services.get(UserServiceProvider);

        return new Auth(userProvider);
    }
}
