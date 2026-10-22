import { RootNode } from '@codama/nodes';

import { OPENAPI_VERSION } from './constants';
import { getAccountFragment, getDefinedTypeFragment, getInstructionFragment } from './fragments';
import { OpenAPIObject } from './types';
import { RenderOptions, yamlFileSeparator } from './utils';

export function buildOpenApi(root: RootNode, options: RenderOptions = {}) {
    const program = root.program;

    const accounts = getAccountFragment(program.name, program.accounts);
    const instructions = getInstructionFragment(program.name, program.instructions);
    const definedTypes = getDefinedTypeFragment(program.definedTypes);

    const allPaths = { ...accounts.paths, ...instructions.paths };
    const allSchemas = { ...definedTypes.schemas, ...accounts.schemas, ...instructions.schemas };

    const { refs: paths, files: pathFiles } = yamlFileSeparator(allPaths, 'paths');
    const { refs: schemas, files: schemaFiles } = yamlFileSeparator(allSchemas, 'schemas');

    const spec: OpenAPIObject = {
        openapi: OPENAPI_VERSION,
        info: {
            title: program.name,
            version: program.version ?? '0.0.0',
            description: `REST API for the ${program.name} Solana program (${program.publicKey}).`,
            'x-program-id': program.publicKey,
        },
        ...(options.serverUrl ? { servers: [{ url: options.serverUrl }] } : {}),
        tags: [{ name: program.name, description: `Instructions and accounts of ${program.name}` }],
        paths,
        components: { schemas },
    };

    return { pathFiles, schemaFiles, spec };
}
