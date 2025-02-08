/**
 * Copyright 2025 Dhiego Cassiano Fogaça Barbosa
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

import { randomBytes } from 'node:crypto';
import { Socket, createSocket } from 'node:dgram';
import { lookup } from 'node:dns';
import { hostname } from 'node:os';

import LogAdapter from "./LogAdapter.js";
import { LogLevel, LogMessage } from "./Logger.js";

export type GELFMessage = {
    /** GELF spec version – “1.1”; MUST be set by the client library. */
    version: string;
    /** the name of the host, source or application that sent this message; MUST be set by the client library. */
    host: string;
    /** a short, descriptive message; MUST be set by the client library. */
    short_message: string;
    /** a long message that can contain a backtrace; optional. */
    full_message?: string;
    /** seconds since UNIX epoch with optional decimal places for milliseconds; SHOULD be set by the client library. If absent, the timestamp will be set to the current time (now).  */
    timestamp?: number;
    /** the level equal to the standard syslog levels; optional. Default is 1 (ALERT). */
    level?: LogLevel;
    /** optional, deprecated. Send as additional field instead. */
    _facility?: string;
    /** the file (with path, if you want) that caused the error (string); optional, deprecated. Send as an additional field instead. */
    _file?: string;
    /** the line in a file that caused the error (decimal); optional, deprecated. Send as an additional field instead. */
    _line?: number;
    /** every field you send and prefix with an underscore ( _) will be treated as an additional field. */
    [key: string]: unknown;
};

export const GELF_MAGIC_BYTES = Buffer.from([0x1e, 0x0f]);

/**
 * Provides a log adapter that outputs to a GELF UDP logger.
 */
export default class GELFLogAdapter extends LogAdapter {
    #socket?: Socket;
    #port: number;
    #maxChunkSize = 8192;

    constructor(address: string, port: number = 3201, maxChunkSize = 8192, minLevel: LogLevel = LogLevel.INFO) {
        super(minLevel);

        this.#port = port;
        this.#maxChunkSize = maxChunkSize;
        lookup(address, (err, address, family) => {
            if (err) {
                throw err;
            }

            this.#socket = createSocket(family == 4 ? 'udp4' : 'udp6');
        });
    }

    override log({ level, message, pid, source, timestamp, exception, ...extra }: LogMessage): void {
        if (!this.#socket) {
            return;
        }

        const gelfExtra = Object.entries(extra).reduce((acc, [key, value]) => {
            if (!key.match(/^[\\w\\.\\-]*$/) || key === 'id') {
                // Allowed characters in field names are any word character (letter, number, underscore), dashes and dots.
                // Libraries SHOULD not allow to send id as additional field ( _id).
                return acc;
            }

            acc[`_${key}`] = value;
            return acc;
        }, {} as Record<string, unknown>);

        const gelfMessage: GELFMessage = {
            version: '1.1',
            host: hostname(),
            short_message: message,
            full_message: message + (exception ? `\n${exception.stack}` : ''),
            timestamp: timestamp.getTime() / 1000,
            level: level,
            _pid: pid,
            _facility: source.method,
            ...gelfExtra
        };

        const messageBytes = Buffer.from(JSON.stringify(gelfMessage), 'utf-8');
        if (messageBytes.length < this.#maxChunkSize) {
            this.#socket.send(messageBytes, this.#port, 'localhost');
            return;
        }

        // Message is too big, split it in chunks.
        const messageId = randomBytes(8);
        const chunks = Math.ceil(messageBytes.length / this.#maxChunkSize);
        if (chunks > 128) {
            // We can't split the message in more than 128 chunks.
            return;
        }

        for (let i = 0; i < chunks; i++) {
            const chunkHeader = this.generateChunkHeader(i, chunks, messageId);
            const chunk = messageBytes.subarray(i * this.#maxChunkSize, (i + 1) * this.#maxChunkSize);

            this.#socket.send(Buffer.concat([chunkHeader, chunk]), this.#port, 'localhost');
        }
    }

    generateChunkHeader(chunk: number, chunks: number, messageId: Buffer): Buffer {
        return Buffer.concat([GELF_MAGIC_BYTES, messageId, Buffer.from([chunk]), Buffer.from([chunks])]);
    }
}
