import type { InstructionAccountNode, InstructionNode } from '@codama/nodes';
import { visit } from '@codama/visitors-core';

import { KNOWN_ADDRESSES } from '../constants';
import type { PathsObject, SchemaMap, SchemaObject } from '../types';
import { pascal } from '../utils';
import { getSchemaVisitor } from '../visitors';

export type InstructionFragment = {
    paths: PathsObject;
    schemas: SchemaMap;
};

// True when we have no way to derive the account's address, so the caller must supply it
export const isUnknownAccount = (acc: InstructionAccountNode): boolean => {
    if (!acc.defaultValue) return true;

    if (KNOWN_ADDRESSES.includes(acc.defaultValue.kind)) return false;

    throw new Error(
        `Account "${acc.name}" has unhandled default value "${acc.defaultValue.kind}". ` +
            `Add it to KNOWN_ADDRESSES or handle it explicitly.`,
    );
};

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

        // discriminator is the first arg for each ix
        for (const arg of ix.arguments ?? []) {
            if (arg.defaultValueStrategy === 'omitted') continue;
            properties[arg.name] = visit(arg.type, visitor);
            required.push(arg.name);
        }

        // Accounts the caller has to send
        for (const acc of (ix.accounts ?? []).filter(isUnknownAccount)) {
            properties[acc.name] = { description: 'base58 account address', type: 'string' };
            if (!acc.isOptional) required.push(acc.name);
        }

        fragment.schemas[requestName] = {
            type: 'object',
            properties,
            ...(required.length ? { required } : {}),
        };

        fragment.paths[`/${programName}/${ix.name}`] = {
            post: {
                operationId: ix.name,
                summary: ix.docs?.length ? ix.docs.join(' ') : `Execute ${ix.name} instruction`,
                tags: [programName],
                requestBody: {
                    content: { 'application/json': { schema: { $ref: `#/components/schemas/${requestName}` } } },
                    required: true,
                },
                responses: {
                    '200': { description: 'Transaction sent' },
                    '400': { description: 'Transaction failed' },
                },
            },
        };
    }

    return fragment;
}
