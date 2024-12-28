/**
 * Copyright 2024 Dhiego Cassiano Fogaça Barbosa
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

import { describe, it } from 'node:test';
import { ok, deepStrictEqual, throws } from 'node:assert';

import { parseHttpHeader } from './headers.js';

await describe('parseHttpHeader', async () => {
    await it('parseHttpHeader handles a single value with no parameters', () => {
        const header = 'text/html';
        const expected = { 'text/html': {} };

        deepStrictEqual(parseHttpHeader(header), expected);
    });

    await it('parseHttpHeader handles multiple values with no parameters', () => {
        const header = 'text/html, application/json, text/plain';
        const expected = {
            'text/html': {},
            'application/json': {},
            'text/plain': {},
        };

        deepStrictEqual(parseHttpHeader(header), expected);
    });

    await it('parseHttpHeader handles parameters with semicolons', () => {
        const header = 'text/html; charset=UTF-8; boundary=something';
        const expected = {
            'text/html': {
                charset: 'UTF-8',
                boundary: 'something',
            },
        };

        deepStrictEqual(parseHttpHeader(header), expected);
    });

    await it('parseHttpHeader handles quoted values with semicolons', () => {
        const header = 'text/html; charset="UTF-8;special"';
        const expected = {
            'text/html': {
                charset: 'UTF-8;special',
            },
        };

        deepStrictEqual(parseHttpHeader(header), expected);
    });

    await it('parseHttpHeader handles multiple values with parameters', () => {
        const header = 'text/html; charset=UTF-8, application/json; version=2';
        const expected = {
            'text/html': { charset: 'UTF-8' },
            'application/json': { version: '2' },
        };

        deepStrictEqual(parseHttpHeader(header), expected);
    });

    await it('parseHttpHeader handles quoted values with commas', () => {
        const header = 'text/html; charset="UTF-8, special", application/json';
        const expected = {
            'text/html': { charset: 'UTF-8, special' },
            'application/json': {},
        };

        deepStrictEqual(parseHttpHeader(header), expected);
    });

    await it('parseHttpHeader handles headers with complex quoting and commas/semicolons', () => {
        const header = '"text/html, more"; charset="UTF-8;special", application/xml; q=0.9';
        const expected = {
            'text/html, more': { charset: 'UTF-8;special' },
            'application/xml': { q: '0.9' },
        };

        deepStrictEqual(parseHttpHeader(header), expected);
    });

    await it('parseHttpHeader handles Accept header with weights', () => {
        const header = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
        const expected = {
            'text/html': {},
            'application/xhtml+xml': {},
            'application/xml': { q: '0.9' },
            '*/*': { q: '0.8' },
        };

        deepStrictEqual(parseHttpHeader(header), expected);
    });

    await it('parseHttpHeader handles Accept-Encoding with commas in quoted values', () => {
        const header = 'gzip, deflate, "br,with,comma"';
        const expected = {
            'gzip': {},
            'deflate': {},
            'br,with,comma': {},
        };

        deepStrictEqual(parseHttpHeader(header), expected);
    });

    await it('parseHttpHeader should throw error on missing main value', () => {
        const header = '; charset=UTF-8';

        throws(() => parseHttpHeader(header), {
            message: /Invalid header value: missing main value/,
        });
    });

    await it('parseHttpHeader should throw error on invalid quoted value', () => {
        const header = 'text/html; charset="UTF-8';

        throws(() => parseHttpHeader(header), {
            message: /Invalid header value: unclosed quoted string/,
        });
    });

    await it('parseHttpHeader should throw error on unexpected equals sign', () => {
        const header = 'text/html; =UTF-8';

        throws(() => parseHttpHeader(header), {
            message: /Invalid header value: unexpected equals sign/,
        });
    });

    await it('parseHttpHeader should handle empty header gracefully', () => {
        const header = '';
        const expected = {}; // No valid parts, should return an empty object

        deepStrictEqual(parseHttpHeader(header), expected);
    });

    await it('parseHttpHeader should handle malformed commas and semicolons', () => {
        const header = 'text/html;, application/json; version=2;,';
        const expected = {
            'text/html': {},
            'application/json': { version: '2' },
        };

        deepStrictEqual(parseHttpHeader(header), expected);
    });

    await it('parseHttpHeader should handle extra whitespace correctly', () => {
        const header = '   text/html  ;  charset="UTF-8"  ,   application/json  ';
        const expected = {
            'text/html': { charset: 'UTF-8' },
            'application/json': {},
        };

        deepStrictEqual(parseHttpHeader(header), expected);
    });

    await it('parseHttpHeader should fail for values missing after semicolon', () => {
        const header = 'text/html; charset';

        throws(() => parseHttpHeader(header), {
            message: /Invalid parameter: missing value/,
        });
    });
});
