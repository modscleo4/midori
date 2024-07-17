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
 * Encodes a number as a 32-bit unsigned integer in big-endian.
 *
 * @param value The number to be encoded.
 *
 * @returns The encoded number as a Buffer.
 */
export function encodeUInt32BE(value: number): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(value, 0);

    return buffer;
}

/**
 * Encodes a buffer with its length as a 32-bit unsigned integer in big-endian.
 *
 * @param data The buffer to be encoded.
 *
 * @returns The encoded buffer.
 */
export function encodeBufferWithLength(data: Buffer): Buffer {
    const length = encodeUInt32BE(data.length);
    return Buffer.concat([length, data]);
}
