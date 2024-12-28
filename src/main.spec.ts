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

import { describe, it } from 'node:test';

await describe('Util', async () => {
    await import('./util/asn1.spec.js');
    await import('./util/cron.spec.js');
    await import('./util/datetime.spec.js');
    await import('./util/headers.spec.js');
    await import('./util/jws.spec.js');
    await import('./util/jwe.spec.js');
    await import('./util/rss.spec.js');
    await import('./util/strings.spec.js');
    await import('./util/uuid.spec.js');
    await import('./util/xml.spec.js');
});
