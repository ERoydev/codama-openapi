import { posix } from 'node:path';

export function yamlFileSeparator<T extends Record<string, unknown>>(
    yamlFragment: T,
    prefix: string,
): { files: Record<string, unknown>; refs: Record<keyof T, { $ref: string }> } {
    const files: Record<string, unknown> = {};
    const refs = {} as Record<keyof T, { $ref: string }>;

    for (const key of Object.keys(yamlFragment) as (keyof T)[]) {
        const item = yamlFragment[key];
        const file = `${posix.join(prefix, String(key).replace(/[{}]/g, ''))}.yaml`;

        const mainFile = posix.join(posix.relative(posix.dirname(file), '.'), 'openapi.yaml');

        files[file] = JSON.parse(JSON.stringify(item).replaceAll('"#/components/', `"${mainFile}#/components/`));

        refs[key] = { $ref: `./${file}` };
    }

    return { files, refs };
}
