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

export function parseStack(e: Error): { method: string, file: string, line: number, column: number; }[] {
    if (!e.stack) {
        return [];
    }

    return e.stack.split('\n')
        .map(l => l.trim())
        .filter(l => l.startsWith('at '))
        .map(l => {
            const { method, file, line, column } = /at ?(?<method>(async )?[^ ]*) \(?(?<file>.*):(?<line>\d+):(?<column>\d+)\)?/g.exec(l)?.groups ?? {};

            return {
                method,
                file,
                line: parseInt(line),
                column: parseInt(column),
            };
        });
}
