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

import { Application } from "../app/Server.js";

export type TaskConstructor = new (app: Application) => Task;
export type TaskFunction = (app: Application) => Promise<void>;

/**
 * Represents a task that can be scheduled.
 */
export default abstract class Task {
    constructor(app: Application) {

    }

    /**
     * Runs the task.
     */
    abstract run(): Promise<void>;

    /**
     * Converts a Task class to a Task function.
     *
     * @param task The Task class to be converted.
     * @param app The application instance.
     *
     * @returns The Task function.
     */
    static asFunction(task: TaskConstructor | TaskFunction, app: Application): TaskFunction {
        if (task.prototype instanceof Task) {
            const instance = new (task as TaskConstructor)(app);

            return instance.run.bind(instance);
        }

        return task as TaskFunction;
    }
}
