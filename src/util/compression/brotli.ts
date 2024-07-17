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

import { Transform } from "node:stream";
import { promisify } from "node:util";
import { brotliCompress, brotliDecompress, brotliCompressSync, brotliDecompressSync, createBrotliCompress, createBrotliDecompress, constants } from "node:zlib";

/**
 * Brotli compression and decompression.
 */
export default class Brotli {
    /**
     * Asynchronously compresses the given data.
     *
     * @param data The data to be compressed
     * @param quality The compression quality (0-11)
     *
     * @returns The compressed data
     */
    static async compress(data: Buffer, quality: number = 5): Promise<Buffer> {
        return await promisify(brotliCompress)(data, { params: { [constants.BROTLI_PARAM_QUALITY]: quality } });
    }

    /**
     * Asynchronously decompresses the given data.
     *
     * @param data The data to be decompressed
     *
     * @returns The decompressed data
     */
    static async decompress(data: Buffer): Promise<Buffer> {
        return await promisify(brotliDecompress)(data);
    }

    /**
     * Synchronously compresses the given data.
     *
     * @param data The data to be compressed
     * @param quality The compression quality (0-11)
     *
     * @returns The compressed data
     */
    static compressSync(data: Buffer, quality: number = 5): Buffer {
        return brotliCompressSync(data, { params: { [constants.BROTLI_PARAM_QUALITY]: quality } });
    }

    /**
     * Synchronously decompresses the given data.
     *
     * @param data The data to be decompressed
     *
     * @returns The decompressed data
     */
    static decompressSync(data: Buffer): Buffer {
        return brotliDecompressSync(data);
    }

    /**
     * Creates a stream to compress data.
     *
     * @param level The compression level (0-11)
     *
     * @returns The stream
     */
    static compressStream(quality: number = 5): Transform {
        const stream = createBrotliCompress({ params: { [constants.BROTLI_PARAM_QUALITY]: quality } });

        return stream;
    }

    /**
     * Creates a stream to decompress data.
     *
     * @returns The stream
     */
    static decompressStream(): Transform {
        const stream = createBrotliDecompress();

        return stream;
    }
}
