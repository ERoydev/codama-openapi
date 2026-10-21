import type { AccountNode } from '@codama/nodes';
import { visit } from '@codama/visitors-core';

import type { PathsObject, SchemaObject } from '../types';
import { pascal } from '../utils';
import { getSchemaVisitor } from '../visitors';

export type AccountFragment = {
    schemas: Record<string, SchemaObject>;
    paths: PathsObject;
};

/**
 * For each program account:
 * - schema: its data struct, e.g. "counter" → "Counter"
 * - path:   GET /<program>/<account>/{address} returning that schema
 */
export function getAccountFragment(programName: string, accounts: readonly AccountNode[] = []): AccountFragment {
    const visitor = getSchemaVisitor();
    const fragment: AccountFragment = { schemas: {}, paths: {} };

    for (const account of [...accounts].sort((a, b) => a.name.localeCompare(b.name))) {
        const name = pascal(account.name);

        // Schema
        fragment.schemas[name] = visit(account.data, visitor);

        // Path
        fragment.paths[`/${programName}/${account.name}/{address}`] = {
            get: {
                operationId: `get${name}`,
                summary: account.docs?.length ? account.docs.join(' ') : `Fetch a ${account.name} account`,
                tags: [programName],
                parameters: [
                    {
                        name: 'address',
                        in: 'path',
                        required: true,
                        description: 'base58 account address',
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Decoded account data',
                        content: { 'application/json': { schema: { $ref: `#/components/schemas/${name}` } } },
                    },
                    '404': { description: 'Account not found' },
                },
            },
        };
    }

    return fragment;
}