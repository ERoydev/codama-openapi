import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { rootNodeVisitor } from '@codama/visitors-core';
import { stringify } from 'yaml';

import { buildOpenApi } from '../buildOpenApiDocument';
import { RenderOptions, writeFiles } from '../utils';

/**
 * Codama entry point: builds the OpenAPI spec from the IDL
 * and writes it to `path` (e.g. "api/openapi.yaml"),
 * with each path in its own file next to it (e.g. "api/paths/...").
 */
export function renderVisitor(path: string, options: RenderOptions = {}) {
    return rootNodeVisitor(root => {
        const { spec, pathFiles, schemaFiles } = buildOpenApi(root, options);
        const outDir = dirname(path);

        write(path, spec); // writes main openapi.yaml spec
        writeFiles(outDir, pathFiles);
        writeFiles(outDir, schemaFiles);
    });
}

function write(target: string, content: unknown) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, stringify(content, { aliasDuplicateObjects: false }));
}
