import { definedTypeNode, numberTypeNode } from '@codama/nodes';
import { expect, test } from 'vitest';

import { getDefinedTypeFragment } from '../../src/fragments';

test('it builds a schema for each defined type', () => {
    const type = definedTypeNode({ name: 'feeBps', type: numberTypeNode('u16') });

    const fragment = getDefinedTypeFragment([type]);

    expect(fragment.schemas.FeeBps).toEqual({ type: 'integer' });
});
