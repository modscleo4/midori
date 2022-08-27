import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";

(function a(path) {
    const files = readdirSync(path);
    for (const file of files) {
        if (file.endsWith('.d.ts')) {
            const content = readFileSync(path + '/' + file, { encoding: 'utf8' });
            if (/ *#private;\r?\n/g.test(content)) {
                console.log(path + '/' + file);
            }
            writeFileSync(path + '/' + file, content.replace(/ *#private;\r?\n/gm, ''), { encoding: 'utf8', flag: 'w' });
        } else if (statSync(path + '/' + file).isDirectory()) {
            a(path + '/' + file);
        }
    }
})('./dist');
