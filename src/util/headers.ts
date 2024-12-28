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

/**
 * Parses an HTTP header value into a structured Record.
 *
 * @param headerValue - The HTTP header value to parse.
 * @returns A record where the main header value is the key, and the additional parameters are nested.
 */
export function parseHttpHeader(headerValue: string): Record<string, Record<string, string>> {
    const result: Record<string, Record<string, string>> = {};
    const entries: string[] = [];

    let currentEntry = '';
    let insideQuotes = false;

    // Split by commas, respecting quoted commas
    for (let i = 0; i < headerValue.length; i++) {
        const char = headerValue[i];

        if (char === '"') {
            insideQuotes = !insideQuotes; // Toggle quoted state
        }

        if (char === ',' && !insideQuotes) {
            entries.push(currentEntry.trim());
            currentEntry = '';
        } else {
            currentEntry += char;
        }
    }

    // Add the last entry
    if (currentEntry) {
        entries.push(currentEntry.trim());
    }

    // Process each entry (split by semicolon for parameters)
    for (const entry of entries) {
        const parts: string[] = [];
        let currentPart = '';
        insideQuotes = false;

        for (let i = 0; i < entry.length; i++) {
            const char = entry[i];

            if (char === '"') {
                insideQuotes = !insideQuotes; // Toggle quoted state
            }

            if (char === ';' && !insideQuotes) {
                currentPart = currentPart.trim();

                // Handle quoted values
                if (currentPart.startsWith('"') && currentPart.endsWith('"')) {
                    currentPart = currentPart.slice(1, -1).replace(/\\(.)/g, '$1'); // Unescape quotes
                }

                parts.push(currentPart);
                currentPart = '';
            } else {
                currentPart += char;
            }
        }

        // Add the last part
        if (currentPart) {
            // Handle quoted values
            if (currentPart.startsWith('"') && currentPart.endsWith('"')) {
                currentPart = currentPart.slice(1, -1).replace(/\\(.)/g, '$1'); // Unescape quotes
            }

            parts.push(currentPart.trim());
        }

        // The first part is the main value
        const mainValue = parts.shift();
        if (!mainValue) {
            throw new Error("Invalid header value: missing main value");
        }

        // Initialize the nested record for this main value
        const parameters: Record<string, string> = {};

        for (const part of parts) {
            if (!part.includes('=')) {
                throw new Error("Invalid parameter: missing value");
            }

            const [key, ...valueParts] = part.split('=');
            if (!key) {
                throw new Error("Invalid header value: unexpected equals sign");
            }

            if (valueParts.length === 0) {
                parameters[key.trim()] = '';
            }

            // Rejoin value parts in case there was an '=' in the quoted string
            let value = valueParts.join('=').trim();

            // Handle quoted values
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1).replace(/\\(.)/g, '$1'); // Unescape quotes
            }

            parameters[key.trim()] = value;
        }

        if (insideQuotes) {
            throw new Error("Invalid header value: unclosed quoted string");
        }

        // Set the main value as the key with its parameters
        result[mainValue] = parameters;
    }

    return result;
}
