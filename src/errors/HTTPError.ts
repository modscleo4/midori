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

import { OutgoingHttpHeaders } from "http";

/**
 * Basic HTTP Error with a status code and message.
 * The HTTPErrorMiddleware will catch this error and send the status code and message to the client.
 */
export default class HTTPError extends Error {
    override name: string = 'HTTPError';

    constructor(
        message: string,
        public status: number = 500,
        public extra: Record<string, unknown> = {},
        public extraHeaders: OutgoingHttpHeaders = {},
    ) {
        super(message);
    }

    toJSON(): object {
        return {
            message: this.message,
            ...this.extra,
        };
    }
}
