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
import { deepStrictEqual, ok } from 'node:assert';

import { globMatch, split } from './strings.js';

await describe('Strings', async () => {
    await it('should glob match MIME types text/*', async () => {
        ok(globMatch('text/*', 'text/plain'));
        ok(globMatch('text/*', 'text/html'));
        ok(globMatch('text/*', 'text/css'));
        ok(globMatch('text/*', 'text/javascript'));
        ok(globMatch('text/*', 'text/xml'));
        ok(globMatch('text/*', 'text/json'));
        ok(globMatch('text/*', 'text/csv'));
        ok(globMatch('text/*', 'text/rtf'));
        ok(globMatch('text/*', 'text/xml'));
        ok(globMatch('text/*', 'text/markdown'));
        ok(globMatch('text/*', 'text/latex'));
        ok(globMatch('text/*', 'text/x-sql'));
        ok(globMatch('text/*', 'text/x-c'));
        ok(globMatch('text/*', 'text/x-java'));
        ok(globMatch('text/*', 'text/x-csharp'));
        ok(globMatch('text/*', 'text/x-python'));
    });

    await it('should glob match MIME types */*', async () => {
        ok(globMatch('*/*', 'text/plain'));
        ok(globMatch('*/*', 'text/html'));
        ok(globMatch('*/*', 'text/css'));
        ok(globMatch('*/*', 'text/javascript'));
        ok(globMatch('*/*', 'text/xml'));
        ok(globMatch('*/*', 'text/json'));
        ok(globMatch('*/*', 'text/csv'));
        ok(globMatch('*/*', 'text/rtf'));
        ok(globMatch('*/*', 'text/xml'));
        ok(globMatch('*/*', 'text/markdown'));
        ok(globMatch('*/*', 'text/latex'));
        ok(globMatch('*/*', 'text/x-sql'));
        ok(globMatch('*/*', 'text/x-c'));
        ok(globMatch('*/*', 'text/x-java'));
        ok(globMatch('*/*', 'text/x-csharp'));
        ok(globMatch('*/*', 'text/x-python'));

        ok(globMatch('*/*', 'application/json'));
        ok(globMatch('*/*', 'application/xml'));
        ok(globMatch('*/*', 'application/javascript'));
        ok(globMatch('*/*', 'application/rtf'));
        ok(globMatch('*/*', 'application/csv'));
        ok(globMatch('*/*', 'application/markdown'));
        ok(globMatch('*/*', 'application/latex'));
        ok(globMatch('*/*', 'application/x-sql'));
        ok(globMatch('*/*', 'application/x-c'));
        ok(globMatch('*/*', 'application/x-java'));
        ok(globMatch('*/*', 'application/x-csharp'));
        ok(globMatch('*/*', 'application/x-python'));
    });

    await it('should not glob match MIME types text/*', async () => {
        ok(!globMatch('text/*', 'application/json'));
        ok(!globMatch('text/*', 'application/xml'));
        ok(!globMatch('text/*', 'application/javascript'));
        ok(!globMatch('text/*', 'application/rtf'));
        ok(!globMatch('text/*', 'application/csv'));
        ok(!globMatch('text/*', 'application/markdown'));
        ok(!globMatch('text/*', 'application/latex'));
        ok(!globMatch('text/*', 'application/x-sql'));
        ok(!globMatch('text/*', 'application/x-c'));
        ok(!globMatch('text/*', 'application/x-java'));
        ok(!globMatch('text/*', 'application/x-csharp'));
        ok(!globMatch('text/*', 'application/x-python'));
    });

    await it('should split a string by a separator', async () => {
        deepStrictEqual(split('a,b,c,d', ','), ['a', 'b', 'c', 'd']);
        deepStrictEqual(split('a,b,c,d', ',', 2), ['a', 'b,c,d']);
        deepStrictEqual(split('a,b,c,d', ',', 3), ['a', 'b', 'c,d']);
        deepStrictEqual(split('a,b,c,d', ',', 4), ['a', 'b', 'c', 'd']);
        deepStrictEqual(split('a,b,c,d', ',', 5), ['a', 'b', 'c', 'd']);
    });
});
