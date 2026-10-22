import {
    instructionAccountNode,
    instructionArgumentNode,
    instructionNode,
    numberTypeNode,
    publicKeyValueNode,
} from '@codama/nodes';
import { expect, test } from 'vitest';

import { getInstructionFragment, isUnknownAccount } from '../../src/fragments';

test('it builds a POST path and request schema for each instruction', () => {
    const ix = instructionNode({
        arguments: [instructionArgumentNode({ name: 'amount', type: numberTypeNode('u64') })],
        name: 'deposit',
    });

    const fragment = getInstructionFragment('vaultExample', [ix]);

    expect(fragment.paths['/vaultExample/deposit']).toBeDefined();
    expect(fragment.schemas.DepositRequest).toEqual({
        properties: { amount: { pattern: '^[0-9]+$', type: 'string' } },
        required: ['amount'],
        type: 'object',
    });
});

test('it includes accounts with no default value as required base58-address properties', () => {
    const ix = instructionNode({
        accounts: [instructionAccountNode({ isSigner: false, isWritable: true, name: 'vault' })],
        name: 'withdraw',
    });

    const fragment = getInstructionFragment('vaultExample', [ix]);

    expect(fragment.schemas.WithdrawRequest).toEqual({
        properties: { vault: { description: 'base58 account address', type: 'string' } },
        required: ['vault'],
        type: 'object',
    });
});

test('it marks an optional account with no default value as not required', () => {
    const ix = instructionNode({
        accounts: [instructionAccountNode({ isOptional: true, isSigner: false, isWritable: true, name: 'vault' })],
        name: 'withdraw',
    });

    const fragment = getInstructionFragment('vaultExample', [ix]);

    expect(fragment.schemas.WithdrawRequest).toEqual({
        properties: { vault: { description: 'base58 account address', type: 'string' } },
        type: 'object',
    });
});

test('it excludes accounts whose address is derivable from a known default value kind', () => {
    const ix = instructionNode({
        accounts: [
            instructionAccountNode({
                defaultValue: publicKeyValueNode('11111111111111111111111111111111'),
                isSigner: false,
                isWritable: false,
                name: 'systemProgram',
            }),
        ],
        name: 'withdraw',
    });

    const fragment = getInstructionFragment('vaultExample', [ix]);

    expect(fragment.schemas.WithdrawRequest).toEqual({ properties: {}, type: 'object' });
});

test('it defaults the summary to "Execute <name> instruction" when the instruction has no docs', () => {
    const ix = instructionNode({ name: 'deposit' });

    const fragment = getInstructionFragment('vaultExample', [ix]);

    expect(fragment.paths['/vaultExample/deposit'].post!.summary).toBe('Execute deposit instruction');
});

test('it joins the instruction docs into the summary when present', () => {
    const ix = instructionNode({ docs: ['Deposits funds', 'into the vault.'], name: 'deposit' });

    const fragment = getInstructionFragment('vaultExample', [ix]);

    expect(fragment.paths['/vaultExample/deposit'].post!.summary).toBe('Deposits funds into the vault.');
});

test('it processes instructions in alphabetical order regardless of input order', () => {
    const fragment = getInstructionFragment('vaultExample', [
        instructionNode({ name: 'zebra' }),
        instructionNode({ name: 'alpha' }),
    ]);

    expect(Object.keys(fragment.schemas)).toEqual(['AlphaRequest', 'ZebraRequest']);
});

test('it returns empty paths and schemas when there are no instructions', () => {
    expect(getInstructionFragment('vaultExample')).toEqual({ paths: {}, schemas: {} });
});

test('it silently overwrites when two instructions share a name, keeping only the last one', () => {
    const first = instructionNode({
        arguments: [instructionArgumentNode({ name: 'amount', type: numberTypeNode('u64') })],
        name: 'deposit',
    });
    const second = instructionNode({ name: 'deposit' });

    const fragment = getInstructionFragment('vaultExample', [first, second]);

    expect(fragment.schemas.DepositRequest).toEqual({ properties: {}, type: 'object' });
});

test('isUnknownAccount returns true when the account has no default value', () => {
    expect(isUnknownAccount(instructionAccountNode({ isSigner: false, isWritable: true, name: 'vault' }))).toBe(true);
});

test('isUnknownAccount returns false for a known default value kind', () => {
    const account = instructionAccountNode({
        defaultValue: publicKeyValueNode('11111111111111111111111111111111'),
        isSigner: false,
        isWritable: false,
        name: 'systemProgram',
    });

    expect(isUnknownAccount(account)).toBe(false);
});

test('isUnknownAccount throws for an unhandled default value kind', () => {
    const account = instructionAccountNode({
        defaultValue: { kind: 'accountBumpValueNode', name: 'bump' } as never,
        isSigner: false,
        isWritable: false,
        name: 'vault',
    });

    expect(() => isUnknownAccount(account)).toThrow(/unhandled default value/);
});
