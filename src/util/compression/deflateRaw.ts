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

import type { Transform } from "node:stream";
import { promisify } from "node:util";
import { createDeflateRaw, createInflateRaw, deflateRaw, deflateRawSync, inflateRaw, inflateRawSync } from "node:zlib";

/**
 * Deflate compression and Inflate decompression without headers.
 */
export default class DeflateRaw {
    /**
     * Asynchronously compresses the given data.
     *
     * @param data The data to be compressed
     * @param level The compression level (0-9)
     *
     * @returns The compressed data
     */
    static async compress(data: Buffer, level: number = 5): Promise<Buffer> {
        return await promisify(deflateRaw)(data, { level });
    }

    /**
     * Asynchronously decompresses the given data.
     *
     * @param data The data to be decompressed
     *
     * @returns The decompressed data
     */
    static async decompress(data: Buffer): Promise<Buffer> {
        return await promisify(inflateRaw)(data);
    }

    /**
     * Synchronously compresses the given data.
     *
     * @param data The data to be compressed
     * @param level The compression level (0-9)
     *
     * @returns The compressed data
     */
    static compressSync(data: Buffer, level: number = 5): Buffer {
        return deflateRawSync(data, { level });
    }

    /**
     * Synchronously decompresses the given data.
     *
     * @param data The data to be decompressed
     *
     * @returns The decompressed data
     */
    static decompressSync(data: Buffer): Buffer {
        return inflateRawSync(data);
    }

    /**
     * Creates a stream to compress data.
     *
     * @param level The compression level (0-9)
     *
     * @returns The stream
     */
    static compressStream(level: number = 5): Transform {
        return createDeflateRaw({ level });
    }

    /**
     * Creates a stream to decompress data.
     *
     * @returns The stream
     */
    static decompressStream(): Transform {
        return createInflateRaw();
    }
}
