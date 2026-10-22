import type { AccountNode } from '@codama/nodes';
import { visit } from '@codama/visitors-core';

import type { PathsObject, SchemaMap } from '../types';
import { pascal } from '../utils';
import { getSchemaVisitor } from '../visitors';

export type AccountFragment = {
    paths: PathsObject;
    schemas: SchemaMap;
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

        fragment.schemas[name] = visit(account.data, visitor);

        fragment.paths[`/${programName}/${account.name}/{address}`] = {
            get: {
                operationId: `get${name}`,
                // account.docs comes from /// comments on the account struct (empty if none)
                summary: account.docs?.length ? account.docs.join(' ') : `Fetch a ${account.name} account`,
                tags: [programName],
                parameters: [
                    {
                        name: 'address',
                        in: 'path',
                        description: 'base58 account address',
                        required: true,
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
