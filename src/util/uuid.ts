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

import { randomUUID } from "node:crypto";

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
    return randomUUID();
}

/**
 * Validate a UUID
 *
 * @param uuid UUID to validate
 * @param version UUID version to validate (-1 to ignore)
 */
export function validateUUID(uuid: string, version: number = 4): boolean {
    return /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(uuid) && (version == -1 ? true : parseInt(uuid[14], 16) === version);
}
