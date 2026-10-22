import { accountNode, numberTypeNode, publicKeyTypeNode, structFieldTypeNode, structTypeNode } from '@codama/nodes';
import { expect, test } from 'vitest';

import { getAccountFragment } from '../../src/fragments';

test('it builds a GET path and schema for each account', () => {
    const account = accountNode({
        data: structTypeNode([
            structFieldTypeNode({ name: 'owner', type: publicKeyTypeNode() }),
            structFieldTypeNode({ name: 'balance', type: numberTypeNode('u64') }),
        ]),
        name: 'vault',
    });

    const fragment = getAccountFragment('vaultExample', [account]);

    expect(fragment.paths['/vaultExample/vault/{address}']).toBeDefined();
    expect(fragment.schemas.Vault).toEqual({
        properties: {
            balance: { pattern: '^[0-9]+$', type: 'string' },
            owner: { description: 'base58 public key', type: 'string' },
        },
        required: ['owner', 'balance'],
        type: 'object',
    });
});
