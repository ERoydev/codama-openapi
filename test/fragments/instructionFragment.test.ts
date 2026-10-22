import { instructionArgumentNode, instructionNode, numberTypeNode } from '@codama/nodes';
import { expect, test } from 'vitest';

import { getInstructionFragment } from '../../src/fragments';

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
