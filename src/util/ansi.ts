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
 * Basic ANSI colors.
 */
export enum Color {
    BLACK = 0,
    RED,
    GREEN,
    YELLOW,
    BLUE,
    MAGENTA,
    CYAN,
    WHITE,
};

export type ANSIOptions = {
    /** ANSI colors to be used. */
    color?: {
        /** Foreground color. */
        fg?: Color;
        /** Background color. */
        bg?: Color;
    };
    /** Toggle bold or highlight. */
    bold?: boolean;
    /** Toggle dim. Not widely supported. */
    dim?: boolean;
    /** Toggle italic. Not widely supported. */
    italic?: boolean;
    /** Toggle underline. */
    underline?: boolean;
};

/**
 * Formats a text with ANSI escape sequences.
 */
export function format(text: string, options?: ANSIOptions): string {
    const fomatters = [];

    if (options?.color?.fg) {
        fomatters.push(options.color.fg + 30);
    }

    if (options?.color?.bg) {
        fomatters.push(options.color.bg + 40);
    }

    if (options?.bold) {
        fomatters.push(1);
    }

    if (options?.dim) {
        fomatters.push(2);
    }

    if (options?.italic) {
        fomatters.push(3);
    }

    if (options?.underline) {
        fomatters.push(4);
    }

    return `\x1b[${fomatters.join(';')}m${text}\x1b[0m`;
}
