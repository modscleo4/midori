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
import { parseCronString, validateCronString } from './cron.js';

await describe('Cron', () => {
    const cronString = [
        '0 0 1 1 *',
        '0 0 1 1 * *',
        '0 0-20 0 1 1 *',
        '0 1-3 1,2,3 * 1,2,3',
        '0 0 1 1 * MON',
        '23 */2 * * *',
        '23 1-20/2 * * *',
    ];

    it('should validate all cron strings', () => {
        ok(parseCronString(cronString[0]));
        ok(parseCronString(cronString[1]));
        ok(parseCronString(cronString[2]));
        ok(parseCronString(cronString[3]));
        ok(parseCronString(cronString[4]));
        ok(parseCronString(cronString[5]));
        ok(parseCronString(cronString[6]));
    });

    it('should not validate an empty cron string', () => {
        ok(!validateCronString(''));
    });

    it('should throw an error when parsing an invalid cron string', () => {
        throws(() => parseCronString('0 0 1 1 * * *'));
    });

    it('should parse a cron string with wildcard', () => {
        const cron = parseCronString(cronString[0]);

        deepStrictEqual(cron.seconds, Array.from({ length: 60 }, (_, i) => i));
        deepStrictEqual(cron.minutes, [0]);
        deepStrictEqual(cron.hours, [0]);
        deepStrictEqual(cron.daysOfMonth, [1]);
        deepStrictEqual(cron.months, [1]);
        deepStrictEqual(cron.daysOfWeek, Array.from({ length: 7 }, (_, i) => i));
    });

    it('should parse a cron string with seconds', () => {
        const cron = parseCronString(cronString[1]);

        deepStrictEqual(cron.seconds, [0]);
        deepStrictEqual(cron.minutes, [0]);
        deepStrictEqual(cron.hours, [1]);
        deepStrictEqual(cron.daysOfMonth, [1]);
        deepStrictEqual(cron.months, Array.from({ length: 12 }, (_, i) => i + 1));
        deepStrictEqual(cron.daysOfWeek, Array.from({ length: 7 }, (_, i) => i));
    });

    it('should parse a cron string with rannge', () => {
        const cron = parseCronString(cronString[2]);

        deepStrictEqual(cron.seconds, [0]);
        deepStrictEqual(cron.minutes, Array.from({ length: 21 }, (_, i) => i));
        deepStrictEqual(cron.hours, [0]);
        deepStrictEqual(cron.daysOfMonth, [1]);
        deepStrictEqual(cron.months, [1]);
        deepStrictEqual(cron.daysOfWeek, Array.from({ length: 7 }, (_, i) => i));
    });

    it('should parse a cron string with ranges', () => {
        const cron = parseCronString(cronString[3]);

        deepStrictEqual(cron.seconds, Array.from({ length: 60 }, (_, i) => i));
        deepStrictEqual(cron.minutes, [0]);
        deepStrictEqual(cron.hours, [1, 2, 3]);
        deepStrictEqual(cron.daysOfMonth, [1, 2, 3]);
        deepStrictEqual(cron.months, Array.from({ length: 12 }, (_, i) => i + 1));
        deepStrictEqual(cron.daysOfWeek, [1, 2, 3]);
    });

    it('should parse a cron string with day of week names', () => {
        const cron = parseCronString(cronString[4]);

        deepStrictEqual(cron.seconds, [0]);
        deepStrictEqual(cron.minutes, [0]);
        deepStrictEqual(cron.hours, [1]);
        deepStrictEqual(cron.daysOfMonth, [1]);
        deepStrictEqual(cron.months, Array.from({ length: 12 }, (_, i) => i + 1));
        deepStrictEqual(cron.daysOfWeek, [1]);
    });

    it('should parse a cron string with step', () => {
        const cron = parseCronString(cronString[5]);

        deepStrictEqual(cron.seconds, Array.from({ length: 60 }, (_, i) => i));
        deepStrictEqual(cron.minutes, [23]);
        deepStrictEqual(cron.hours, Array.from({ length: 12 }, (_, i) => i * 2));
        deepStrictEqual(cron.daysOfMonth, Array.from({ length: 31 }, (_, i) => i + 1));
        deepStrictEqual(cron.months, Array.from({ length: 12 }, (_, i) => i + 1));
        deepStrictEqual(cron.daysOfWeek, Array.from({ length: 7 }, (_, i) => i));
    });

    it('should parse a cron string with step and range', () => {
        const cron = parseCronString(cronString[6]);

        deepStrictEqual(cron.seconds, Array.from({ length: 60 }, (_, i) => i));
        deepStrictEqual(cron.minutes, [23]);
        deepStrictEqual(cron.hours, [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
        deepStrictEqual(cron.daysOfMonth, Array.from({ length: 31 }, (_, i) => i + 1));
        deepStrictEqual(cron.months, Array.from({ length: 12 }, (_, i) => i + 1));
        deepStrictEqual(cron.daysOfWeek, Array.from({ length: 7 }, (_, i) => i));
    });
});
