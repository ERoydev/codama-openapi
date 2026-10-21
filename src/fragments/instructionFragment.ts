import type { InstructionAccountNode, InstructionNode } from '@codama/nodes';
import { visit } from '@codama/visitors-core';

import type { PathsObject, SchemaObject } from '../types';
import { pascal } from '../utils';
import { getSchemaVisitor } from '../visitors';

export type InstructionFragment = {
    paths: PathsObject;
    schemas: Record<string, SchemaObject>;
};

// Accounts the backend fills in itself, so they're not in the request
const RESOLVED_BY_BACKEND = [
    'pdaValueNode', // derived from seeds
    'publicKeyValueNode', // fixed address (e.g. system program)
    'programIdValueNode',
    'payerValueNode',
    'identityValueNode',
];

const isFromRequest = (acc: InstructionAccountNode) =>
    acc.isSigner !== true && !(acc.defaultValue && RESOLVED_BY_BACKEND.includes(acc.defaultValue.kind));

/**
 * For each instruction:
 * - schema: <Name>Request, from its args + accounts the caller must send
 * - path:   POST /<program>/<instruction>
 */
export function getInstructionFragment(
    programName: string,
    instructions: readonly InstructionNode[] = [],
): InstructionFragment {
    const visitor = getSchemaVisitor();
    const fragment: InstructionFragment = { paths: {}, schemas: {} };

    for (const ix of [...instructions].sort((a, b) => a.name.localeCompare(b.name))) {
        const requestName = `${pascal(ix.name)}Request`;
        const properties: Record<string, SchemaObject> = {};
        const required: string[] = [];

        // Arguments (skip the Anchor discriminator)
        for (const arg of ix.arguments ?? []) {
            if (arg.defaultValueStrategy === 'omitted') continue;
            properties[arg.name] = visit(arg.type, visitor);
            required.push(arg.name);
        }

        // Accounts the caller has to send
        for (const acc of (ix.accounts ?? []).filter(isFromRequest)) {
            properties[acc.name] = { description: 'base58 account address', type: 'string' };
            if (!acc.isOptional) required.push(acc.name);
        }

        // Schema
        fragment.schemas[requestName] = {
            properties,
            type: 'object',
            ...(required.length ? { required } : {}),
        };

        // Path
        fragment.paths[`/${programName}/${ix.name}`] = {
            post: {
                operationId: ix.name,
                requestBody: {
                    content: { 'application/json': { schema: { $ref: `#/components/schemas/${requestName}` } } },
                    required: true,
                },
                responses: {
                    '200': { description: 'Transaction sent' },
                    '400': { description: 'Transaction failed' },
                },
                summary: ix.docs?.length ? ix.docs.join(' ') : `Execute ${ix.name} instruction`,
                tags: [programName],
            },
        };
    }

    return fragment;
}
