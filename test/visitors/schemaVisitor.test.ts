import { numberTypeNode } from '@codama/nodes';
import { visit } from '@codama/visitors-core';
import { expect, test } from 'vitest';

import { getSchemaVisitor } from '../../src/visitors';

test('it maps a u64 number type to a string pattern', () => {
    const result = visit(numberTypeNode('u64'), getSchemaVisitor());

    expect(result).toEqual({ pattern: '^[0-9]+$', type: 'string' });
});
