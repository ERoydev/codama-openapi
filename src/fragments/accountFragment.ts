import type { AccountNode } from '@codama/nodes';
import { visit } from '@codama/visitors-core';

import type { PathsObject, SchemaObject } from '../types';
import { pascal } from '../utils';
import { getSchemaVisitor } from '../visitors';

export type AccountFragment = {
    paths: PathsObject;
    schemas: Record<string, SchemaObject>;
};

/**
 * For each program account:
 * - schema: its data struct, e.g. "counter" → "Counter"
 * - path:   GET /<program>/<account>/{address} returning that schema
 */
export function getAccountFragment(programName: string, accounts: readonly AccountNode[] = []): AccountFragment {
    const visitor = getSchemaVisitor();
    const fragment: AccountFragment = { paths: {}, schemas: {} };

    for (const account of [...accounts].sort((a, b) => a.name.localeCompare(b.name))) {
        const name = pascal(account.name);

        // Schema
        fragment.schemas[name] = visit(account.data, visitor);

        // Path
        fragment.paths[`/${programName}/${account.name}/{address}`] = {
            get: {
                operationId: `get${name}`,

                parameters: [
                    {
                        description: 'base58 account address',
                        in: 'path',
                        name: 'address',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],

                responses: {
                    '200': {
                        content: { 'application/json': { schema: { $ref: `#/components/schemas/${name}` } } },
                        description: 'Decoded account data',
                    },
                    '404': { description: 'Account not found' },
                },
                // on Anchor IDL's, account.docs is never populated
                summary: account.docs?.length ? account.docs.join(' ') : `Fetch a ${account.name} account`,
                tags: [programName],
            },
        };
    }

    return fragment;
}
