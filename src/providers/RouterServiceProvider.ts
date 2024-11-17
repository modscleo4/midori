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

import type { Application } from "../app/Server.js";
import ServiceProvider from "../app/ServiceProvider.js";
import type Router from "../router/Router.js";
import type { Constructor } from "../util/types.js";

export abstract class RouterServiceProvider extends ServiceProvider<Router> {
    static override service: symbol = Symbol('midori::Router');
}

export default function RouterServiceProviderFactory(routerService: Router): Constructor<RouterServiceProvider> & { [K in keyof typeof RouterServiceProvider]: typeof RouterServiceProvider[K] } {
    return class extends RouterServiceProvider {
        override register(app: Application): Router {
            return routerService;
        }
    };
}
