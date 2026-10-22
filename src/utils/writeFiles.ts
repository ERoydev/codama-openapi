import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { stringify } from 'yaml';

export function writeFiles(outDir: string, files: Record<string, unknown>) {
    for (const [file, content] of Object.entries(files)) {
        const target = join(outDir, file);
        write(target, content);
    }
}

function write(target: string, content: unknown) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, stringify(content, { aliasDuplicateObjects: false }));
}
