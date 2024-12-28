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

import { filterUndefined } from "./object.js";

const yearPattern = /^([+-]?\d{4})$/;  // YYYY
const datePatterns = [
    /^([+-]?\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^([+-]?\d{4})(\d{2})(\d{2})$/,   // YYYYMMDD
    /^([+-]?\d{4})-(\d{2})$/,         // YYYY-MM
];
const dateWeekPatterns = [
    /^([+-]?\d{4})-W(\d{2})(?:-(\d))?$/, // YYYY-Www-D
    /^([+-]?\d{4})W(\d{2})(?:(\d))?$/,   // YYYYWwwD
];
const dateOrdinalPattern = /^([+-]?\d{4})-?(\d{3})$/; // YYYY-DDD
const timePatterns = [
    /^T(\d{2}):(\d{2}):(\d{2}.\d{3})$/, // Thh:mm:ss.sss
    /^T(\d{2})(\d{2})(\d{2}.\d{3})$/,   // Thhmmss.sss
    /^T(\d{2}):(\d{2}):(\d{2})$/,       // Thh:mm:ss
    /^T(\d{2})(\d{2})(\d{2})$/,         // Thhmmss
    /^T(\d{2}):(\d{2}.\d{3})$/,         // Thh:mm.mmm
    /^T(\d{2})(\d{2}.\d{3})$/,          // Thhmm.mmm
    /^T(\d{2}):(\d{2})$/,               // Thh:mm
    /^T(\d{2})(\d{2})$/,                // Thhmm
    /^T(\d{2}.\d{3})$/,                 // Thh.hhh
    /^T(\d{2})$/,                       // Thh
];
const timezonePatterns = [
    /^Z$/,                     // Z
    /^([+-]?\d{2}):(\d{2})$/,  // ±hh:mm
    /^([+-]?\d{2})(\d{2})$/,   // ±hhmm
    /^([+-]?\d{2})$/,          // ±hh
];
const durationPatterns = [
    /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/, // PnYnMnDTnHnMnS
    /^P(?:(\d+)W)$/,                                                                         // PnW
];
const recurringIntervalPatterns = [
    /^R(\d+)\/(.+)$/, // Rn/interval
    /^R()\/(.+)$/,    // R/interval
];

export type ISO8601Date = {
    year: number;
    month?: number;
    day?: number;
} | {
    year: number;
    week?: number;
    weekday?: number;
} | {
    year: number;
    ordinal?: number;
};

export type ISO8601Time = {
    hour: number;
    minute?: number;
    second?: number;
};

export type ISO8601TimeZone = {
    offset: number;
    minutes?: number;
};

export type ISO8601DateTime = ISO8601Date & ISO8601Time;

export type ISO8601DateTimeTZ = ISO8601DateTime & {
    timezone: ISO8601TimeZone;
};

export type ISO8601Duration = {
    years?: number;
    months?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
} | {
    weeks: number;
};

export type ISO8601Interval = {
    start: ISO8601DateTime | ISO8601DateTimeTZ | ISO8601Date;
    end: ISO8601DateTime | ISO8601DateTimeTZ | ISO8601Date | ISO8601Duration;
} | {
    start: ISO8601Duration;
    end?: ISO8601DateTime | ISO8601DateTimeTZ | ISO8601Date;
};

export type ISO8601RecurringInterval = {
    interval: ISO8601Interval;
    repeat: number;
};

export type ISO8601 = ISO8601Date
    | ISO8601Time
    | ISO8601DateTime
    | ISO8601DateTimeTZ
    | ISO8601Duration
    | ISO8601Interval
    | ISO8601RecurringInterval;

/**
 * Parses an ISO 8601 date-time string.
 * The following formats are supported:
 * - Date: YYYY, YYYY-MM-DD, YYYYMMDD, YYYY-MM, YYYY-Www-D, YYYYWwwD, YYYY-DDD
 * - Time: Thh, Thh:mm, Thhmm, Thh:mm:ss, Thhmmss, Thh:mm.mmm, Thhmm.mmm, Thh:mm:ss.sss, Thhmmss.sss
 * - Timezone: Z, ±hh, ±hh:mm, ±hhmm
 * - Date-time: <Date>T<Time>, <Date>T<Time><Timezone>
 * - Duration: PnYnMnDTnHnMnS, PnW, P<Date>T<Time>
 * - Interval: <Date-time>/<Date-time>, <Date-time>/<Duration>, <Duration>/<Date-time>, <Duration>
 * - Recurring interval: Rn/<Interval>, R/<Interval>
 *
 * If the string is invalid, an error is thrown.
 *
 * @param input The ISO 8601 date-time string.
 * @returns The parsed date-time object.
 */
export function parseISO8601(input: string): ISO8601 {
    const date = parseISO8601Date(input);
    if (date) return date;

    const time = parseISO8601Time(input.startsWith('T') ? input : 'T' + input);
    if (time) return time;

    const timeTZ = parseISO8601TimeTZ(input.startsWith('T') ? input : 'T' + input);
    if (timeTZ) return timeTZ;

    const dateTime = parseISO8601DateTime(input);
    if (dateTime) return dateTime;

    const timezone = parseISO8601TimeZone(input);
    if (timezone) return timezone;

    const dateTimeWithTimeZone = parseISO8601DateTimeWithTimeZone(input);
    if (dateTimeWithTimeZone) return dateTimeWithTimeZone;

    const duration = parseISO8601Duration(input);
    if (duration) return duration;

    const interval = parseISO8601Interval(input);
    if (interval) return interval;

    const recurringInterval = parseISO8601RecurringInterval(input);
    if (recurringInterval) return recurringInterval;

    throw new Error('Invalid ISO 8601 date-time string');
}

export function parseISO8601Year(input: string): ISO8601Date | undefined {
    const match = yearPattern.test(input);
    if (!match) return;

    const [_, year] = input.match(yearPattern)!;

    return {
        year: parseInt(year),
    };
}

export function parseISO8601DateWeek(input: string): ISO8601Date | null {
    for (const pattern of dateWeekPatterns) {
        const match = pattern.test(input);
        if (!match) continue;

        const [_, year, week, weekday] = input.match(pattern)!;

        return filterUndefined({
            year: parseInt(year),
            week: parseInt(week),
            weekday: weekday ? parseInt(weekday) : undefined,
        });
    }

    return null;
}

export function parseISO8601DateOrdinal(input: string): ISO8601Date | null {
    const match = dateOrdinalPattern.test(input);
    if (!match) return null;

    const [_, year, ordinal] = input.match(dateOrdinalPattern)!;

    return {
        year: parseInt(year),
        ordinal: parseInt(ordinal),
    };
}

export function parseISO8601Date(input: string): ISO8601Date | null {
    const parsedYear = parseISO8601Year(input);
    if (parsedYear) return parsedYear;

    const parsedDateWeek = parseISO8601DateWeek(input);
    if (parsedDateWeek) return parsedDateWeek;

    const parsedDateOrdinal = parseISO8601DateOrdinal(input);
    if (parsedDateOrdinal) return parsedDateOrdinal;

    for (const pattern of datePatterns) {
        const match = pattern.test(input);
        if (!match) continue;

        const [_, year, month, day] = input.match(pattern)!;

        return filterUndefined({
            year: parseInt(year),
            month: month ? parseInt(month) : undefined,
            day: day ? parseInt(day) : undefined,
        });
    }

    return null;
}

export function parseISO8601Time(input: string): ISO8601Time | null {
    for (const pattern of timePatterns) {
        const match = pattern.test(input);
        if (!match) continue;

        const [_, hour, minute, second] = input.match(pattern)!;

        return filterUndefined({
            hour: parseFloat(hour),
            minute: minute ? parseFloat(minute) : undefined,
            second: second ? parseFloat(second) : undefined,
        });
    }

    return null;
}

export function parseISO8601TimeZone(input: string): ISO8601TimeZone | undefined {
    for (const pattern of timezonePatterns) {
        const match = pattern.test(input);
        if (!match) continue;

        if (input === 'Z') return { offset: 0 };

        const [_, offset, minutes] = input.match(pattern)!;

        return filterUndefined({
            offset: parseInt(offset),
            minutes: minutes ? parseInt(minutes) : undefined,
        });
    }

    return;
}

export function parseISO8601TimeTZ(input: string): ISO8601Time & { timezone: ISO8601TimeZone; } | null {
    for (const timePattern of timePatterns) {
        const _timePattern = timePattern.source.substring(0, timePattern.source.length - 1);

        for (const tzPattern of timezonePatterns) {
            const _tzPattern = tzPattern.source.substring(1);

            const match = new RegExp(`${_timePattern}${_tzPattern}`).test(input);
            if (!match) continue;

            const [_, hour, minute, second] = input.match(_timePattern)!;

            return filterUndefined({
                hour: parseFloat(hour),
                minute: minute ? parseFloat(minute) : undefined,
                second: second ? parseFloat(second) : undefined,
                timezone: parseISO8601TimeZone(input.substring(_.length))!,
            });
        }
    }

    return null;
}

export function parseISO8601DateTime(input: string): ISO8601DateTime | null {
    if (!input.includes('T')) return null;

    const [date, time] = input.split('T');
    const parsedDate = parseISO8601Date(date);
    const parsedTime = parseISO8601Time('T' + time);

    if (!parsedDate || !parsedTime) return null;

    return {
        ...parsedDate,
        ...parsedTime,
    };
}

export function parseISO8601DateTimeWithTimeZone(input: string): ISO8601DateTimeTZ | null {
    if (!input.includes('T')) return null;

    const [date, time] = input.split('T');
    const parsedDate = parseISO8601Date(date);
    const parsedTime = parseISO8601TimeTZ('T' + time);

    if (!parsedDate || !parsedTime) return null;

    return {
        ...parsedDate,
        ...parsedTime,
    };
}

export function parseISO8601Duration(input: string): ISO8601Duration | null {
    for (const pattern of durationPatterns) {
        const match = pattern.test(input);
        if (!match) continue;

        if (input.endsWith('W')) {
            const [_, weeks] = input.match(pattern)!;

            return { weeks: parseInt(weeks) };
        }

        const [_, years, months, days, hours, minutes, seconds] = input.match(pattern)!;

        return filterUndefined({
            years: years ? parseInt(years) : undefined,
            months: months ? parseInt(months) : undefined,
            days: days ? parseInt(days) : undefined,
            hours: hours ? parseInt(hours) : undefined,
            minutes: minutes ? parseInt(minutes) : undefined,
            seconds: seconds ? parseFloat(seconds) : undefined,
        });
    }

    if (input.startsWith('P')) {
        const parsedDateTime = parseISO8601DateTime(input.substring(1));
        if (!parsedDateTime || !('month' in parsedDateTime)) return null;

        return filterUndefined({
            years: parsedDateTime.year,
            months: parsedDateTime.month,
            days: parsedDateTime.day,
            hours: parsedDateTime.hour,
            minutes: parsedDateTime.minute,
            seconds: parsedDateTime.second,
        });
    }

    return null;
}

function parseISO8601IntervalComponentWithDuration(input: string): ISO8601Date | ISO8601DateTime | ISO8601DateTimeTZ | ISO8601Duration | null {
    const parsedDuration = parseISO8601Duration(input);
    if (parsedDuration) return parsedDuration;

    return parseISO8601IntervalComponent(input);
}

function parseISO8601IntervalComponent(input: string): ISO8601Date | ISO8601DateTime | ISO8601DateTimeTZ | null {
    const parsedDate = parseISO8601Date(input);
    if (parsedDate) return parsedDate;

    const parsedDateTime = parseISO8601DateTime(input);
    if (parsedDateTime) return parsedDateTime;

    const parsedDateTimeTZ = parseISO8601DateTimeWithTimeZone(input);
    if (parsedDateTimeTZ) return parsedDateTimeTZ;

    return null;
}

export function parseISO8601Interval(input: string): ISO8601Interval | null {
    const [start, end] = input.split('/');

    const parsedDuration = parseISO8601Duration(start);
    if (parsedDuration) {
        if (!end) return { start: parsedDuration };

        const parsedEnd = parseISO8601IntervalComponent(end);
        if (!parsedEnd) return null;

        return {
            start: parsedDuration,
            end: parsedEnd,
        };
    }

    const parsedStart = parseISO8601IntervalComponent(start);
    const parsedEnd = parseISO8601IntervalComponentWithDuration(end);

    if (!parsedStart || !parsedEnd) return null;

    return {
        start: parsedStart,
        end: parsedEnd,
    };
}

export function parseISO8601RecurringInterval(input: string): ISO8601RecurringInterval | null {
    for (const pattern of recurringIntervalPatterns) {
        const match = pattern.test(input);
        if (!match) continue;

        const [_, repeat, interval] = input.match(pattern)!;

        const parsedInterval = parseISO8601Interval(interval);
        if (!parsedInterval) return null;

        return {
            interval: parsedInterval,
            repeat: repeat ? parseInt(repeat) : Infinity,
        };
    }

    return null;
}
