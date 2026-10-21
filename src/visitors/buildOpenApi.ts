import type { RootNode } from '@codama/nodes';
import { RenderOptions } from '../utils/options';

export function buildOpenApi(root: RootNode, _options: RenderOptions) {
    const program = root.program;
    const paths: Record<string, unknown> = {};

    for (const ix of program.instructions ?? []) {
        paths[`/${program.name}/${ix.name}`] = {
            post: { operationId: ix.name, responses: { '200': { description: 'OK' } } },
        };
    }

    return {
        openapi: '3.1.0',
        info: { title: program.name, version: program.version ?? '0.0.0' },
        paths,
    };
}