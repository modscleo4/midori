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
    minute: number[];
    hour: number[];
    dayOfMonth: number[];
    month: number[];
    dayOfWeek: number[];
};

export function validateCronString(cronString: string): boolean {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = cronString.split(" ", 5);

    function validateCronPart(part: string, min: number, max: number): boolean {
        if (part === "*") {
            return true;
        }

        if (part.includes(",")) {
            return part.split(",").every(p => validateCronPart(p, min, max));
        }

        if (part.includes("-")) {
            const [start, end] = part.split("-", 2).map(Number);
            return start >= min
                && end <= max;
        }

        if (part.includes("/")) {
            const [start, step] = part.split("/", 2).map(Number);
            return start >= min
                && start <= max
                && step >= 1
                && step <= max - min + 1;
        }

        const n = Number(part);
        return n >= min && n <= max;
    }

    return validateCronPart(minute, 0, 59)
        && validateCronPart(hour, 0, 23)
        && validateCronPart(dayOfMonth, 1, 31)
        && validateCronPart(month, 1, 12)
        && validateCronPart(dayOfWeek, 0, 6);
}

export function parseCronString(cronString: string): CronExpression {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = cronString.split(" ", 5);

    function parseCronPart(part: string, min: number, max: number): number[] {
        if (part === "*") {
            return Array.from({ length: max - min + 1 }, (_, i) => i + min);
        }

        if (part.includes(",")) {
            return part.split(",").flatMap(p => parseCronPart(p, min, max));
        }

        if (part.includes("-")) {
            const [start, end] = part.split("-", 2).map(Number);
            return Array.from({ length: end - start + 1 }, (_, i) => i + start);
        }

        if (part.includes("/")) {
            const [start, step] = part.split("/", 2).map(Number);
            return Array.from({ length: max - min + 1 }, (_, i) => i + min).filter(n => (n - start) % step === 0);
        }

        return [Number(part)];
    }

    return {
        minute: parseCronPart(minute, 0, 59),
        hour: parseCronPart(hour, 0, 23),
        dayOfMonth: parseCronPart(dayOfMonth, 1, 31),
        month: parseCronPart(month, 1, 12),
        dayOfWeek: parseCronPart(dayOfWeek, 0, 6),
    };
}

export function canRunTask(cronExpression: CronExpression, lastRun: Date, now: Date): boolean {
    if (!lastRun) {
        lastRun = now;
    }

    if (now.getMinutes() == lastRun.getMinutes()) {
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
