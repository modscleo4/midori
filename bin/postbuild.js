import { readdirSync, statSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

(async function _(path) {
    const files = readdirSync(path);
    for (const file of files) {
        if (file.endsWith('.d.ts')) {
            const content = await readFile(path + '/' + file, { encoding: 'utf8' });
            if (/ *#private;\r?\n/g.test(content)) {
                console.log(path + '/' + file);
                await writeFile(path + '/' + file, content.replace(/ *#private;\r?\n/gm, ''), { encoding: 'utf8', flag: 'w' });
            }
        } else if (statSync(path + '/' + file).isDirectory()) {
            await _(path + '/' + file);
        }
    }
})('./dist');
