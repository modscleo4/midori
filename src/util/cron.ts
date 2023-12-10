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

export type CronExpression = {
    second: number[];
    minute: number[];
    hour: number[];
    dayOfMonth: number[];
    month: number[];
    dayOfWeek: number[];
};

export function validateCronString(cronString: string): boolean {
    const [second, minute, hour, dayOfMonth, month, dayOfWeek] = cronString.split(" ", 6);

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
                && parseInt(step) >= min
        }

        const n = Number(part);
        return n >= min && n <= max;
    }

    return validateCronPart(second, 0, 59)
        && validateCronPart(minute, 0, 59)
        && validateCronPart(hour, 0, 23)
        && validateCronPart(dayOfMonth, 1, 31)
        && validateCronPart(month, 1, 12)
        && validateCronPart(dayOfWeek, 0, 6);
}

export function parseCronString(cronString: string): CronExpression {
    const [second, minute, hour, dayOfMonth, month, dayOfWeek] = cronString.split(" ", 6);

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
        // Only works with */n format
        if (part.includes('/')) {
            const [start, step] = part.split('/', 2);
            const s = start === '*' ? min : parseInt(start);
            const st = parseInt(step);

            return Array.from({ length: Math.floor((max - s) / st) + 1 }, (_, i) => i * st + s);
        }

        return [Number(part)];
    }

    return {
        second: parseCronPart(second, 0, 59),
        minute: parseCronPart(minute, 0, 59),
        hour: parseCronPart(hour, 0, 23),
        dayOfMonth: parseCronPart(dayOfMonth, 1, 31),
        month: parseCronPart(month, 1, 12),
        dayOfWeek: parseCronPart(dayOfWeek, 0, 6),
    };
}

export function canRunTask(cronExpression: CronExpression, now: Date, lastRun?: Date): boolean {
    if (lastRun && now.getSeconds() === lastRun.getSeconds()) {
        return false;
    }

    if (!cronExpression.second.includes(now.getSeconds())) {
        return false;
    }

    if (!cronExpression.minute.includes(now.getMinutes())) {
        return false;
    }

    if (!cronExpression.hour.includes(now.getHours())) {
        return false;
    }

    if (!cronExpression.dayOfMonth.includes(now.getDate())) {
        return false;
    }

    if (!cronExpression.month.includes(now.getMonth() + 1)) {
        return false;
    }

    if (!cronExpression.dayOfWeek.includes(now.getDay())) {
        return false;
    }

    return true;
}
