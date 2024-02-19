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
import { brotliCompress, brotliDecompress, createBrotliCompress, createBrotliDecompress, constants } from "node:zlib";

export default class Brotli {
    static async compress(data: Buffer, quality: number = 5): Promise<Buffer> {
        return await promisify(brotliCompress)(data, { params: { [constants.BROTLI_PARAM_QUALITY]: quality } });
    }

    static async decompress(data: Buffer): Promise<Buffer> {
        return await promisify(brotliDecompress)(data);
    }

    static compressStream(quality: number = 5): Transform {
        const stream = createBrotliCompress({ params: { [constants.BROTLI_PARAM_QUALITY]: quality } });

        return stream;
    }

    static decompressStream(): Transform {
        const stream = createBrotliDecompress();

        return stream;
    }
}
