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
 * Represents a cron expression.
 */
export type CronExpression = {
    /** Seconds. (0-59) */
    seconds: number[];
    /** Minutes. (0-59) */
    minutes: number[];
    /** Hours. (0-23) */
    hours: number[];
    /** Days of the month. (1-31) */
    daysOfMonth: number[];
    /** Months. (1-12) */
    months: number[];
    /** Days of the week. (0-6) */
    daysOfWeek: number[];
};

/**
 * Validates a part of a cron string. The part can be a number, a range, a list, a step or the wildcard.
 *
 * @param part The part to be validated.
 * @param min The minimum value.
 * @param max The maximum value.
 *
 * @returns Whether the part is valid.
 */
function validateCronPart(part: string, min: number, max: number): boolean {
    if (!part) {
        return false;
    }

    // Any
    if (part === '*') {
        return true;
    }

    // List
    if (part.includes(',')) {
        return part.split(',').every(p => validateCronPart(p, min, max));
    }

    // Range
    if (part.includes('-')) {
        const [start, end] = part.split('-', 2).map(parseInt);
        return start >= min
            && end <= max;
    }

    // Step
    if (part.includes('/')) {
        const [start, step] = part.split('/', 2);
        return (start === '*' || parseInt(start) >= min)
            && parseInt(step) >= min;
    }

    const n = parseInt(part, 10);
    return n >= min && n <= max;
}

/**
 * Validates a cron string.
 *
 * @param cronString The cron string to be validated.
 *
 * @returns Whether the cron string is valid.
 */
export function validateCronString(cronString: string): boolean {
    const [second, minute, hour, dayOfMonth, month, dayOfWeek] = cronString.split(" ", 6);

    return validateCronPart(second, 0, 59)
        && validateCronPart(minute, 0, 59)
        && validateCronPart(hour, 0, 23)
        && validateCronPart(dayOfMonth, 1, 31)
        && validateCronPart(month, 1, 12)
        && validateCronPart(dayOfWeek, 0, 6);
}

/**
 * Parses a part of a cron string. The part can be a number, a range, a list, a step or the wildcard.
 *
 * @param part The part to be parsed.
 * @param min The minimum value.
 * @param max The maximum value.
 *
 * @returns The parsed part as an array of numbers.
 */
function parseCronPart(part: string, min: number, max: number): number[] {
    // Any
    if (part === '*') {
        return Array.from({ length: max - min + 1 }, (_, i) => i + min);
    }

    // List
    if (part.includes(',')) {
        return part.split(',').flatMap(p => parseCronPart(p, min, max));
    }

    // Range
    if (part.includes('-')) {
        const [start, end] = part.split('-', 2).map(parseInt);
        return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    }

    // Step
    if (part.includes('/')) {
        const [start, step] = part.split('/', 2);
        const s = start === '*' ? min : parseInt(start);
        const st = parseInt(step);

        return Array.from({ length: Math.floor((max - s) / st) + 1 }, (_, i) => i * st + s);
    }

    return [Number(part)];
}

/**
 * Parses a cron string.
 *
 * @param cronString The cron string to be parsed.
 *
 * @returns The parsed cron expression.
 */
export function parseCronString(cronString: string): CronExpression {
    const [second, minute, hour, dayOfMonth, month, dayOfWeek] = cronString.split(" ", 6);

    return {
        seconds: parseCronPart(second, 0, 59),
        minutes: parseCronPart(minute, 0, 59),
        hours: parseCronPart(hour, 0, 23),
        daysOfMonth: parseCronPart(dayOfMonth, 1, 31),
        months: parseCronPart(month, 1, 12),
        daysOfWeek: parseCronPart(dayOfWeek, 0, 6),
    };
}

/**
 * Checks if a task can run based on a cron expression.
 *
 * @param cronExpression The cron expression parsed by `parseCronString`.
 * @param now The current date and time.
 * @param lastRun The last time the task was run.
 *
 * @returns Whether the task can run or not.
 */
export function canRunTask(cronExpression: CronExpression, now: Date, lastRun?: Date): boolean {
    if (lastRun && now.getSeconds() === lastRun.getSeconds()) {
        return false;
    }

    if (!cronExpression.seconds.includes(now.getSeconds())) {
        return false;
    }

    if (!cronExpression.minutes.includes(now.getMinutes())) {
        return false;
    }

    if (!cronExpression.hours.includes(now.getHours())) {
        return false;
    }

    if (!cronExpression.daysOfMonth.includes(now.getDate())) {
        return false;
    }

    if (!cronExpression.months.includes(now.getMonth() + 1)) {
        return false;
    }

    if (!cronExpression.daysOfWeek.includes(now.getDay())) {
        return false;
    }

    return true;
}
