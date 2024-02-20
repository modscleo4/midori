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
import { createDeflateRaw, createInflateRaw, deflateRaw, deflateRawSync, inflateRaw, inflateRawSync } from "node:zlib";

export default class DeflateRaw {
    static async compress(data: Buffer, level: number = 5): Promise<Buffer> {
        return await promisify(deflateRaw)(data, { level });
    }

    static async decompress(data: Buffer): Promise<Buffer> {
        return await promisify(inflateRaw)(data);
    }

    static compressSync(data: Buffer, level: number = 5): Buffer {
        return deflateRawSync(data, { level });
    }

    static decompressSync(data: Buffer): Buffer {
        return inflateRawSync(data);
    }

    static compressStream(level: number = 5): Transform {
        const stream = createDeflateRaw({ level });

        return stream;
    }

    static decompressStream(): Transform {
        const stream = createInflateRaw();

        return stream;
    }
}