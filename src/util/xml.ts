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

export function serializeXML(node: XMLNode, format: boolean = false, level: number = 0): string {
    const attributes = Object.entries(node.attributes ?? []).map(([key, value]) => `${key}="${escapeXML(value)}"`).join(' ');
    const children = node.children?.map(c => serializeXML(c, format, level + 1)).join('');
    const text = escapeXML(node.text ?? '');

    const encoding = level === 0 ? `<?xml version="1.0" encoding="UTF-8"?>${format ? '\n' : ''}` : '';
    const prefix = format ? ' '.repeat(level * 2) : '';
    const suffix = format ? '\n' : '';
    const body = text ? `${text}` : children ? `${suffix}${children}${prefix}` : '';

    return `${encoding}${prefix}<${node.name}${attributes ? ` ${attributes}` : ''}>${body}</${node.name}>${suffix}`;
}
