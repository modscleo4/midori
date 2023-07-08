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

import { KeyPairSyncResult, generateKeyPairSync } from "node:crypto";

export function generateKeypair(alg: 'rsa' | 'ec'): KeyPairSyncResult<string, string> {
    switch (alg) {
        case 'rsa':
            return generateKeyPairSync(alg, {
                publicKeyEncoding: {
                    format: 'pem',
                    type: 'spki'
                },
                privateKeyEncoding: {
                    format: 'pem',
                    type: 'pkcs8',
                },
                modulusLength: 2048,
            });

        case 'ec':
            return generateKeyPairSync(alg, {
                publicKeyEncoding: {
                    format: 'pem',
                    type: 'spki'
                },
                privateKeyEncoding: {
                    format: 'pem',
                    type: 'pkcs8',
                },
                namedCurve: 'secp521r1',
            });
    }
}
