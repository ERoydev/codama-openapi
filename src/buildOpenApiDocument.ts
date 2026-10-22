import { RootNode } from '@codama/nodes';

import { OPENAPI_VERSION } from './constants';
import { getAccountFragment, getDefinedTypeFragment, getInstructionFragment } from './fragments';
import { OpenAPIObject, PathsObject } from './types';
import { RenderOptions, yamlFileSeparator } from './utils';

export function buildOpenApi(root: RootNode, options: RenderOptions = {}) {
    const program = root.program;

    const accounts = getAccountFragment(program.name, program.accounts);
    const instructions = getInstructionFragment(program.name, program.instructions);
    const definedTypes = getDefinedTypeFragment(program.definedTypes);

    const basePathSegments = (options.basePath ?? '').split('/').filter(Boolean);
    const basePath = basePathSegments.length ? `/${basePathSegments.join('/')}` : '';
    const allPaths = prefixPaths({ ...accounts.paths, ...instructions.paths }, basePath);
    const allSchemas = { ...definedTypes.schemas, ...accounts.schemas, ...instructions.schemas };

    const { refs: paths, files: pathFiles } = yamlFileSeparator(allPaths, 'paths');
    const { refs: schemas, files: schemaFiles } = yamlFileSeparator(allSchemas, 'schemas');

    const spec: OpenAPIObject = {
        openapi: OPENAPI_VERSION,
        info: {
            title: options.title ?? program.name,
            version: options.version ?? program.version ?? '0.0.0',
            description:
                options.description ?? `REST API for the ${program.name} Solana program (${program.publicKey}).`,
            'x-program-id': program.publicKey,
        },
        ...(options.serverUrl ? { servers: [{ url: options.serverUrl }] } : {}),
        tags: [{ name: program.name, description: `Instructions and accounts of ${program.name}` }],
        paths,
        components: { schemas },
    };

    return { pathFiles, schemaFiles, spec };
}

function prefixPaths(paths: PathsObject, basePath: string): PathsObject {
    if (!basePath) return paths;
    return Object.fromEntries(Object.entries(paths).map(([path, item]) => [`${basePath}${path}`, item])) as PathsObject;
}
