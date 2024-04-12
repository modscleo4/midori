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

import { Dirent, existsSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, normalize } from "node:path";

import { EStatusCode } from "../http/EStatusCode.js";
import Middleware from "../http/Middleware.js";
import Request from "../http/Request.js";
import Response from "../http/Response.js";
import { Constructor } from "../util/types.js";
import { Application } from "../app/Server.js";
import { PublicPathConfig, PublicPathConfigProvider } from "../providers/PublicPathConfigProvider.js";

export class PublicPathMiddleware extends Middleware {
    #options: PublicPathConfig | undefined;

    constructor(app: Application) {
        super(app);

        this.#options = app.config.get(PublicPathConfigProvider);
    }

    get options(): PublicPathConfig | undefined {
        return this.#options;
    }

    override async process(req: Request, next: (req: Request) => Promise<Response>): Promise<Response> {
        // Only GET and HEAD requests are allowed
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return await next(req);
        }

        // If no path was configured, continue the request
        if (!this.options?.path) {
            return await next(req);
        }

        // Don't allow path traversal
        if (req.path.includes('..')) {
            return Response.redirect(normalize(req.path));
        }

        const indexFiles = this.options?.indexFiles ?? ['index.html'];

        // If the request ends with a slash, try to find an index file
        if (req.path.endsWith('/') || req.path === '') {
            for (const file of indexFiles) {
                const res = await this.tryFile(req.path + file, req);
                if (res) {
                    return res;
                }
            }

            if (this.options?.generateIndex) {
                const files = await this.listDirectory(req.path);
                if (files) {
                    return Response.html(`
                    <h1>Index of ${req.path}</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Last Modified</th>
                                <th>Size</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${files.map(file => {
                            const stat = statSync(join(this.options?.path!, normalize(req.path), normalize(file.name)));
                            return `
                            <tr>
                                <td><a href="${file.isDirectory() ? file.name + '/' : file.name}">${file.isDirectory() ? file.name + '/' : file.name}</a></td>
                                <td>${stat.mtime.toUTCString()}</td>
                                <td>${stat.size}</td>
                            </tr>`;
                        }).join('')}
                        </tbody>
                    </table>`);
                }
            }
        } else {
            const res = await this.tryFile(req.path, req);
            if (res) {
                return res;
            }
        }

        // If no file was found, continue the request
        return await next(req);
    }

    /** @internal */
    async tryFile(path: string, req?: Request): Promise<Response | false> {
        // Try to find a matching file in the public directory
        const filename = join(this.options?.path!, normalize(path));

        // If the file exists, return it
        if (existsSync(filename) && statSync(filename).isFile()) {
            const res = Response.file(filename, req);
            if (this.options?.cache?.maxAge) {
                res.withHeader('Cache-Control', `public, max-age=${this.options.cache.maxAge}`);
            }

            return res;
        }

        return false;
    }

    /** @internal */
    async listDirectory(path: string): Promise<Dirent[] | false> {
        const dir = join(this.options?.path!, normalize(path));
        if (!existsSync(dir) || !statSync(dir).isDirectory()) {
            return false;
        }

        return await readdir(dir, { withFileTypes: true });
    }
}

/**
 * Middleware to serve static files from a given directory.
 */
export default function PublicPathMiddlewareFactory(options: PublicPathConfig): Constructor<Middleware> {
    return class extends PublicPathMiddleware {
        override get options(): PublicPathConfig {
            return options;
        }
    };
}
