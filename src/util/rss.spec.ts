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

import { rss } from './rss.js';
import { type XMLNode } from './xml.js';

await describe('RSS', async () => {
    await it('should return a valid RSS feed', async () => {
        const feed = rss({
            title: 'Test RSS Feed',
            description: 'This is a test RSS feed',
            link: 'https://example.com',
            items: [
                {
                    title: 'Test RSS Item',
                    description: 'This is a test RSS item',
                    link: 'https://example.com',
                    pubDate: new Date('2024-01-01'),
                },
            ],
        });

        ok(feed);
        deepStrictEqual(feed, <XMLNode> {
            name: 'rss',
            attributes: {
                version: '2.0',
            },
            children: [
                {
                    name: 'channel',
                    children: [
                        { name: 'title', text: 'Test RSS Feed', },
                        { name: 'link', text: 'https://example.com', },
                        { name: 'description', text: 'This is a test RSS feed', },
                        {
                            name: 'item',
                            children: [
                                { name: 'title', text: 'Test RSS Item', },
                                { name: 'description', text: 'This is a test RSS item', },
                                { name: 'link', text: 'https://example.com', },
                                { name: 'pubDate', text: 'Mon, 01 Jan 2024 00:00:00 GMT', },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    await it('should return a valid RSS feed with an image', async () => {
        const feed = rss({
            title: 'Test RSS Feed',
            description: 'This is a test RSS feed',
            link: 'https://example.com',
            image: {
                url: 'https://example.com/image.png',
                title: 'Test RSS Feed Image',
                link: 'https://example.com',
            },
            items: [
                {
                    title: 'Test RSS Item',
                    description: 'This is a test RSS item',
                    link: 'https://example.com',
                    pubDate: new Date('2024-01-01'),
                },
            ],
        });

        ok(feed);
        deepStrictEqual(feed, <XMLNode> {
            name: 'rss',
            attributes: {
                version: '2.0',
            },
            children: [
                {
                    name: 'channel',
                    children: [
                        { name: 'title', text: 'Test RSS Feed', },
                        { name: 'link', text: 'https://example.com', },
                        { name: 'description', text: 'This is a test RSS feed', },
                        {
                            name: 'image',
                            children: [
                                { name: 'url', text: 'https://example.com/image.png', },
                                { name: 'title', text: 'Test RSS Feed Image', },
                                { name: 'link', text: 'https://example.com', },
                            ],
                        },
                        {
                            name: 'item',
                            children: [
                                { name: 'title', text: 'Test RSS Item', },
                                { name: 'description', text: 'This is a test RSS item', },
                                { name: 'link', text: 'https://example.com', },
                                { name: 'pubDate', text: 'Mon, 01 Jan 2024 00:00:00 GMT', },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    await it('should return a valid RSS feed with multiple items', async () => {
        const feed = rss({
            title: 'Test RSS Feed',
            description: 'This is a test RSS feed',
            link: 'https://example.com',
            items: [
                {
                    title: 'Test RSS Item 1',
                    description: 'This is a test RSS item 1',
                    link: 'https://example.com/1',
                    pubDate: new Date('2024-01-01'),
                },
                {
                    title: 'Test RSS Item 2',
                    description: 'This is a test RSS item 2',
                    link: 'https://example.com/2',
                    pubDate: new Date('2024-01-02'),
                },
            ],
        });

        ok(feed);
        deepStrictEqual(feed, <XMLNode> {
            name: 'rss',
            attributes: {
                version: '2.0',
            },
            children: [
                {
                    name: 'channel',
                    children: [
                        { name: 'title', text: 'Test RSS Feed', },
                        { name: 'link', text: 'https://example.com', },
                        { name: 'description', text: 'This is a test RSS feed', },
                        {
                            name: 'item',
                            children: [
                                { name: 'title', text: 'Test RSS Item 1', },
                                { name: 'description', text: 'This is a test RSS item 1', },
                                { name: 'link', text: 'https://example.com/1', },
                                { name: 'pubDate', text: 'Mon, 01 Jan 2024 00:00:00 GMT', },
                            ],
                        },
                        {
                            name: 'item',
                            children: [
                                { name: 'title', text: 'Test RSS Item 2', },
                                { name: 'description', text: 'This is a test RSS item 2', },
                                { name: 'link', text: 'https://example.com/2', },
                                { name: 'pubDate', text: 'Tue, 02 Jan 2024 00:00:00 GMT', },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    await it('should return a valid RSS feed with multiple items and an image', async () => {
        const feed = rss({
            title: 'Test RSS Feed',
            description: 'This is a test RSS feed',
            link: 'https://example.com',
            image: {
                url: 'https://example.com/image.png',
                title: 'Test RSS Feed Image',
                link: 'https://example.com',
            },
            items: [
                {
                    title: 'Test RSS Item 1',
                    description: 'This is a test RSS item 1',
                    link: 'https://example.com/1',
                    pubDate: new Date('2024-01-01'),
                },
                {
                    title: 'Test RSS Item 2',
                    description: 'This is a test RSS item 2',
                    link: 'https://example.com/2',
                    pubDate: new Date('2024-01-02'),
                },
            ],
        });

        ok(feed);
        deepStrictEqual(feed, <XMLNode> {
            name: 'rss',
            attributes: {
                version: '2.0',
            },
            children: [
                {
                    name: 'channel',
                    children: [
                        { name: 'title', text: 'Test RSS Feed', },
                        { name: 'link', text: 'https://example.com', },
                        { name: 'description', text: 'This is a test RSS feed', },
                        {
                            name: 'image',
                            children: [
                                { name: 'url', text: 'https://example.com/image.png', },
                                { name: 'title', text: 'Test RSS Feed Image', },
                                { name: 'link', text: 'https://example.com', },
                            ],
                        },
                        {
                            name: 'item',
                            children: [
                                { name: 'title', text: 'Test RSS Item 1', },
                                { name: 'description', text: 'This is a test RSS item 1', },
                                { name: 'link', text: 'https://example.com/1', },
                                { name: 'pubDate', text: 'Mon, 01 Jan 2024 00:00:00 GMT', },
                            ],
                        },
                        {
                            name: 'item',
                            children: [
                                { name: 'title', text: 'Test RSS Item 2', },
                                { name: 'description', text: 'This is a test RSS item 2', },
                                { name: 'link', text: 'https://example.com/2', },
                                { name: 'pubDate', text: 'Tue, 02 Jan 2024 00:00:00 GMT', },
                            ],
                        },
                    ],
                },
            ],
        });
    });
});
