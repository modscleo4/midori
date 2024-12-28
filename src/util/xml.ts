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

export type XMLNode = {
    /** The name of the node. */
    name: string;
    /** The attributes of the node. */
    attributes?: {
        [key: string]: string;
    };
} & (
    {
        /** The text of the node. */
        text: string;
        /** The children of the node. */
        children?: never;
    } | {
        /** The text of the node. */
        text?: never;
        /** The children of the node. */
        children: XMLNode[];
    }
);

function escapeXML(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function unescapeXML(str: string): string {
    return str
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, '\'')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

export function serializeXML(node: XMLNode, spaces: number = 0, level: number = 0): string {
    const attributes = Object.entries(node.attributes ?? [])
        .map(([key, value]) => `${key}="${escapeXML(value)}"`)
        .join(' ');

    const encoding = level === 0 ? `<?xml version="1.0" encoding="UTF-8"?>${spaces > 0 ? '\n' : ''}` : '';
    const prefix = spaces > 0 ? ' '.repeat(level * spaces) : '';
    const suffix = spaces > 0 ? '\n' : '';

    const children = node.children?.map(c => serializeXML(c, spaces, level + 1)).join('');
    const text = escapeXML(node.text ?? '');
    const body = text ? `${text}` : children ? `${suffix}${children}${prefix}` : '';

    return `${encoding}${prefix}<${node.name}${attributes ? ` ${attributes}` : ''}>${body}</${node.name}>${suffix}`;
}

export function* serializeXMLGenerator(node: XMLNode, spaces: number = 0, level: number = 0): Generator<string> {
    const attributes = Object.entries(node.attributes ?? [])
        .map(([key, value]) => `${key}="${escapeXML(value)}"`)
        .join(' ');

    const encoding = level === 0 ? `<?xml version="1.0" encoding="UTF-8"?>${spaces > 0 ? '\n' : ''}` : '';
    const prefix = spaces > 0 ? ' '.repeat(level * spaces) : '';
    const suffix = spaces > 0 ? '\n' : '';

    if (level === 0) {
        yield encoding;
    }

    yield `${prefix}<${node.name}${attributes ? ` ${attributes}` : ''}>`;

    if (node.text) {
        yield escapeXML(node.text);
    } else if (node.children) {
        for (const child of node.children) {
            yield* serializeXMLGenerator(child, spaces, level + 1);
        }
    }

    // Emit the closing tag
    yield `${prefix}</${node.name}>${suffix}`;
}
