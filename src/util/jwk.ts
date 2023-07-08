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

export type Payload = {
    /** Key type */
    kty?: string,

    /** Public Key use */
    use?: 'sig' | 'enc',

    /** Key Operations */
    key_ops?: ('sign' | 'verify' | 'encrypt' | 'decrypt' | 'wrapKey' | 'unwrapKey' | 'deriveKey' | 'deriveBits')[],

    /** Algorithm */
    alg?: string,

    /** Key ID */
    kid?: string,

    /** X.509 URL */
    x5u?: string,

    /** X.509 Certificate Chain */
    x5c?: string[],

    /** X.509 Certificate SHA-1 Thumbprint */
    x5t?: string,

    /** X.509 Certificate SHA-256 Thumbprint */
    'x5t#S256'?: string,
};

export type PayloadEC = Payload & {
    crv?: string,
    x?: string,
    y?: string,

    d?: string,
};

export type PayloadRSA = Payload & {
    mod?: string,
    exp?: string,

    n?: string,
    e?: string,
    d?: string,
    p?: string,
    q?: string,
    dp?: string,
    dq?: string,
    qi?: string,
};

export type PayloadSymmetric = Payload & {
    k?: string,
};
