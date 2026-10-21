import { RootNode } from '@codama/nodes';
import { posix } from 'node:path';

import { getAccountFragment, getInstructionFragment } from './fragments';
import { OpenAPIObject, PathsObject } from './types';
import { RenderOptions } from './utils';
import { OPENAPI_VERSION } from './constants';

export function buildOpenApi(root: RootNode, options: RenderOptions = {}) {
    const program = root.program;

    const accounts = getAccountFragment(program.name, program.accounts);
    const instructions = getInstructionFragment(program.name, program.instructions);

    const allPaths = { ...accounts.paths, ...instructions.paths };
    const allSchemas = { ...accounts.schemas, ...instructions.schemas };

    const pathFiles: Record<string, unknown> = {};
    const paths: PathsObject = {};

    // Each path → its own file, openapi.yaml only keeps a $ref
    for (const [path, item] of Object.entries(allPaths)) {
        const file = `paths${path.replace(/[{}]/g, '')}.yaml`;

        // From this file back to openapi.yaml, e.g. "../../../openapi.yaml"
        const mainFile = posix.join(posix.relative(posix.dirname(file), '.'), 'openapi.yaml');

        // "#/components/..." → "../../../openapi.yaml#/components/..."
        pathFiles[file] = JSON.parse(
            JSON.stringify(item).replaceAll('"#/components/', `"${mainFile}#/components/`),
        );

        paths[path as `/${string}`] = { $ref: `./${file}` };
    }

    const spec: OpenAPIObject = {
        openapi: OPENAPI_VERSION,
        info: { title: program.name, version: program.version ?? '0.0.0' },
        ...(options.serverUrl ? { servers: [{ url: options.serverUrl }] } : {}),
        paths,
        components: { schemas: allSchemas },
    };

    return { spec, pathFiles };
}