import { existsSync, rmSync } from 'node:fs';

export function cleanOutDir(outDir: string) {
    if (existsSync(outDir)) rmSync(outDir, { force: true, recursive: true });
}
