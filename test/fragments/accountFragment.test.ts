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

test('it defaults the summary to "Fetch a <name> account" when the account has no docs', () => {
    const account = accountNode({ data: structTypeNode([]), name: 'vault' });

    const fragment = getAccountFragment('vaultExample', [account]);

    expect(fragment.paths['/vaultExample/vault/{address}'].get!.summary).toBe('Fetch a vault account');
});

test('it joins the account docs into the summary when present', () => {
    const account = accountNode({ data: structTypeNode([]), docs: ['The vault', 'holding funds.'], name: 'vault' });

    const fragment = getAccountFragment('vaultExample', [account]);

    expect(fragment.paths['/vaultExample/vault/{address}'].get!.summary).toBe('The vault holding funds.');
});

test('it processes accounts in alphabetical order regardless of input order', () => {
    const accounts = [
        accountNode({ data: structTypeNode([]), name: 'zebra' }),
        accountNode({ data: structTypeNode([]), name: 'alpha' }),
    ];

    const fragment = getAccountFragment('vaultExample', accounts);

    expect(Object.keys(fragment.schemas)).toEqual(['Alpha', 'Zebra']);
});

test('it returns empty paths and schemas when there are no accounts', () => {
    expect(getAccountFragment('vaultExample')).toEqual({ paths: {}, schemas: {} });
});

test('it silently overwrites when two accounts share a name, keeping only the last one', () => {
    const first = accountNode({
        data: structTypeNode([structFieldTypeNode({ name: 'owner', type: publicKeyTypeNode() })]),
        name: 'vault',
    });
    const second = accountNode({ data: structTypeNode([]), name: 'vault' });

    const fragment = getAccountFragment('vaultExample', [first, second]);

    expect(fragment.schemas.Vault).toEqual({ properties: {}, type: 'object' });
});
