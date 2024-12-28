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
import { ok, deepStrictEqual, throws, doesNotThrow } from 'node:assert';
import { parseISO8601 } from './datetime.js';

await describe('parseISO8601', async () => {
    await it("should parse YYYY format", () => {
        const result = parseISO8601("2023");
        deepStrictEqual(result, { year: 2023 });
    });

    await it("should parse YYYY-MM-DD format", () => {
        const result = parseISO8601("2023-12-26");
        deepStrictEqual(result, { year: 2023, month: 12, day: 26 });
    });

    await it("should compact YYYYMMDD format", () => {
        const result = parseISO8601("20231226");
        deepStrictEqual(result, { year: 2023, month: 12, day: 26 });
    });

    await it("should parse YYYY-MM format", () => {
        const result = parseISO8601("2023-12");
        deepStrictEqual(result, { year: 2023, month: 12 });
    });

    await it("should parse YYYY-Www-D format", () => {
        const result = parseISO8601("2023-W52-2");
        deepStrictEqual(result, { year: 2023, week: 52, weekday: 2 });
    });

    await it("should parse YYYYWwwD format", () => {
        const result = parseISO8601("2023W522");
        deepStrictEqual(result, { year: 2023, week: 52, weekday: 2 });
    });

    await it("should parse YYYY-Www format", () => {
        const result = parseISO8601("2023-W52");
        deepStrictEqual(result, { year: 2023, week: 52 });
    });

    await it("should parse YYYYWww format", () => {
        const result = parseISO8601("2023W52");
        deepStrictEqual(result, { year: 2023, week: 52 });
    });

    await it("should parse YYYY-DDD format", () => {
        const result = parseISO8601("2023-360");
        deepStrictEqual(result, { year: 2023, ordinal: 360 });
    });

    await it("should compact YYYYDDD format", () => {
        const result = parseISO8601("2023360");
        deepStrictEqual(result, { year: 2023, ordinal: 360 });
    });

    await it("should parse Thh:mm:ss.sss format", () => {
        const result = parseISO8601("T15:27:46.123");
        deepStrictEqual(result, { hour: 15, minute: 27, second: 46.123 });
    });

    await it("should parse Thhmmss.sss format", () => {
        const result = parseISO8601("T152746.123");
        deepStrictEqual(result, { hour: 15, minute: 27, second: 46.123 });
    });

    await it("should parse Thh:mm:ss format", () => {
        const result = parseISO8601("T15:27:46");
        deepStrictEqual(result, { hour: 15, minute: 27, second: 46 });
    });

    await it("should parse Thhmmss format", () => {
        const result = parseISO8601("T152746");
        deepStrictEqual(result, { hour: 15, minute: 27, second: 46 });
    });

    await it("should parse Thh:mm.mmm format", () => {
        const result = parseISO8601("T15:27.123");
        deepStrictEqual(result, { hour: 15, minute: 27.123 });
    });

    await it("should parse Thhmm.mmm format", () => {
        const result = parseISO8601("T1527.123");
        deepStrictEqual(result, { hour: 15, minute: 27.123 });
    });

    await it("should parse Thh:mm format", () => {
        const result = parseISO8601("T15:27");
        deepStrictEqual(result, { hour: 15, minute: 27 });
    });

    await it("should parse Thhmm format", () => {
        const result = parseISO8601("T1527");
        deepStrictEqual(result, { hour: 15, minute: 27 });
    });

    await it("should parse Thh.hhh format", () => {
        const result = parseISO8601("T15.123");
        deepStrictEqual(result, { hour: 15.123 });
    });

    await it("should parse Thh format", () => {
        const result = parseISO8601("T15");
        deepStrictEqual(result, { hour: 15 });
    });

    await it("should parse Thh:mm:ssZ format", () => {
        const result = parseISO8601("T15:27:46Z");
        deepStrictEqual(result, { hour: 15, minute: 27, second: 46, timezone: { offset: 0 } });
    });

    await it("should parse Thh:mm:ss+-hh:mm format", () => {
        const result = parseISO8601("T15:27:46+05:00");
        deepStrictEqual(result, { hour: 15, minute: 27, second: 46, timezone: { offset: 5, minutes: 0 } });
    });

    await it("should parse Thh:mm:ss+-hhmm format", () => {
        const result = parseISO8601("T15:27:46+0500");
        deepStrictEqual(result, { hour: 15, minute: 27, second: 46, timezone: { offset: 5, minutes: 0 } });
    });

    await it("should parse Thh:mm:ss+-hh format", () => {
        const result = parseISO8601("T15:27:46+05");
        deepStrictEqual(result, { hour: 15, minute: 27, second: 46, timezone: { offset: 5 } });
    });

    await it("should parse YYYY-MM-DDThh:mm:ss.sssZ format", () => {
        const result = parseISO8601("2023-12-26T15:27:46.123Z");
        deepStrictEqual(result, { year: 2023, month: 12, day: 26, hour: 15, minute: 27, second: 46.123, timezone: { offset: 0 } });
    });

    await it("should parse YYYYMMDDThhmmss.sssZ format", () => {
        const result = parseISO8601("20231226T152746.123Z");
        deepStrictEqual(result, { year: 2023, month: 12, day: 26, hour: 15, minute: 27, second: 46.123, timezone: { offset: 0 } });
    });

    await it("should parse YYYY-Www-DThh:mm:ss.sssZ format", () => {
        const result = parseISO8601("2023-W52-2T15:27:46.123Z");
        deepStrictEqual(result, { year: 2023, week: 52, weekday: 2, hour: 15, minute: 27, second: 46.123, timezone: { offset: 0 } });
    });

    await it("should parse PnYnMnDTnHnMnS format", () => {
        const result = parseISO8601("P3Y6M4DT12H30M5S");
        deepStrictEqual(result, { years: 3, months: 6, days: 4, hours: 12, minutes: 30, seconds: 5 });
    });

    await it("should parse PnW format", () => {
        const result = parseISO8601("P4W");
        deepStrictEqual(result, { weeks: 4 });
    });

    await it("should parse PnYYYY-MM-DDThh:mm:ss format", () => {
        const result = parseISO8601("P1985-04-12T23:20:50");
        deepStrictEqual(result, { years: 1985, months: 4, days: 12, hours: 23, minutes: 20, seconds: 50 });
    });

    await it("should parse interval format (<Date-time>/<Date-time>)", () => {
        const result = parseISO8601("2007-03-01T13:00:00Z/2008-05-11T15:30:00Z");
        deepStrictEqual(result, {
            start: { year: 2007, month: 3, day: 1, hour: 13, minute: 0, second: 0, timezone: { offset: 0 } },
            end: { year: 2008, month: 5, day: 11, hour: 15, minute: 30, second: 0, timezone: { offset: 0 } },
        });
    });

    await it("should parse interval format (<Date-time>/<Duration>)", () => {
        const result = parseISO8601("2007-03-01T13:00:00Z/P1Y2M10DT2H30M");
        deepStrictEqual(result, {
            start: { year: 2007, month: 3, day: 1, hour: 13, minute: 0, second: 0, timezone: { offset: 0 } },
            end: { years: 1, months: 2, days: 10, hours: 2, minutes: 30 },
        });
    });

    await it("should parse interval format (<Duration>/<Date-time>)", () => {
        const result = parseISO8601("P1Y2M10DT2H30M/2008-05-11T15:30:00Z");
        deepStrictEqual(result, {
            start: { years: 1, months: 2, days: 10, hours: 2, minutes: 30 },
            end: { year: 2008, month: 5, day: 11, hour: 15, minute: 30, second: 0, timezone: { offset: 0 } },
        });
    });

    await it("should parse recurring interval format (Rn/<Date-time>/<Duration>)", () => {
        const result = parseISO8601("R3/2007-03-01T13:00:00Z/P1Y2M10DT2H30M");
        deepStrictEqual(result, {
            repeat: 3,
            interval: {
                start: { year: 2007, month: 3, day: 1, hour: 13, minute: 0, second: 0, timezone: { offset: 0 } },
                end: { years: 1, months: 2, days: 10, hours: 2, minutes: 30 },
            },
        });
    });

    await it("should parse recurring interval format (R/<Duration>)", () => {
        const result = parseISO8601("R/PT1H");
        deepStrictEqual(result, {
            repeat: Infinity,
            interval: {
                start: { hours: 1 }
            },
        });
    });

    await it('should throw an error when the date is invalid', async () => {
        throws(() => parseISO8601('2024-12-31t23:59:59.999'));
    });
});
