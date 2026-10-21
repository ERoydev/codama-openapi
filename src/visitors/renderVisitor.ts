import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { rootNodeVisitor } from '@codama/visitors-core';
import { stringify } from 'yaml';

import { RenderOptions } from '../utils/options';
import { buildOpenApi } from './buildOpenApi';

export function renderVisitor(path: string, options: RenderOptions = {}) {
    return rootNodeVisitor(root => {
        const spec = buildOpenApi(root, options);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, stringify(spec));
    });
}

// export function renderVisitor(path: string, options: RenderOptions = {}) {
//     return rootNodeVisitor(root => {
//         // Delete existing generated folder.
//         if (options.deleteFolderBeforeRendering ?? true) {
//             deleteDirectory(path);
//         }

//         // Render the new files.
//         const renderMap = visit(root, getRenderMapVisitor(options));
//         writeRenderMap(renderMap, path);
//     });
// }
