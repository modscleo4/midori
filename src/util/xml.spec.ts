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
import { ok, strictEqual } from 'node:assert';
import { serializeXML, type XMLNode } from './xml.js';

await describe('XML', () => {
    it('should serialize a simple XML', () => {
        const node: XMLNode = {
            name: 'root',
            children: [
                {
                    name: 'child',
                    text: 'Hello, World!'
                }
            ]
        };

        const xml = serializeXML(node);

        strictEqual(xml, '<?xml version="1.0" encoding="UTF-8"?><root><child>Hello, World!</child></root>');
    });

    it('should serialize a complex XML', () => {
        const node: XMLNode = {
            name: 'root',
            children: [
                {
                    name: 'child',
                    attributes: {
                        id: '1'
                    },
                    children: [
                        {
                            name: 'grandchild',
                            text: 'Hello, World!'
                        }
                    ]
                }
            ]
        };

        const xml = serializeXML(node);

        strictEqual(xml, '<?xml version="1.0" encoding="UTF-8"?><root><child id="1"><grandchild>Hello, World!</grandchild></child></root>');
    });

    it('should serialize a complex XML with format', () => {
        const node: XMLNode = {
            name: 'root',
            children: [
                {
                    name: 'child',
                    attributes: {
                        id: '1'
                    },
                    children: [
                        {
                            name: 'grandchild',
                            text: 'Hello, World!'
                        }
                    ]
                }
            ]
        };

        const xml = serializeXML(node, true);

        strictEqual(xml, '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <child id="1">\n    <grandchild>Hello, World!</grandchild>\n  </child>\n</root>\n');
    });
});
