import { RootNode } from '@codama/nodes';

import { OPENAPI_VERSION } from './constants';
import { getAccountFragment, getDefinedTypeFragment, getInstructionFragment } from './fragments';
import { OpenAPIObject } from './types';
import { RenderOptions, YamlFileSeparator } from './utils';

export function buildOpenApi(root: RootNode, options: RenderOptions = {}) {
    const program = root.program;

    const accounts = getAccountFragment(program.name, program.accounts);
    const instructions = getInstructionFragment(program.name, program.instructions);
    const definedTypes = getDefinedTypeFragment(program.definedTypes);

    const allPaths = { ...accounts.paths, ...instructions.paths };
    const allSchemas = { ...definedTypes, ...accounts.schemas, ...instructions.schemas };

    const { refs: paths, files: pathFiles } = YamlFileSeparator(allPaths, 'paths');
    const { refs: schemas, files: schemaFiles } = YamlFileSeparator(allSchemas, 'schemas');

    const spec: OpenAPIObject = {
        info: { title: program.name, version: program.version ?? '0.0.0' },
        openapi: OPENAPI_VERSION,
        ...(options.serverUrl ? { servers: [{ url: options.serverUrl }] } : {}),
        components: { schemas },
        paths,
    };

    return { pathFiles, schemaFiles, spec };
}
