import type { DefinedTypeNode } from '@codama/nodes';
import { visit } from '@codama/visitors-core';

import type { SchemaMap } from '../types';
import { pascal } from '../utils';
import { getSchemaVisitor } from '../visitors';

export type DefinedTypeFragment = {
    schemas: SchemaMap;
};

export function getDefinedTypeFragment(definedTypes: readonly DefinedTypeNode[] = []): DefinedTypeFragment {
    const visitor = getSchemaVisitor();
    const fragment: DefinedTypeFragment = { schemas: {} };

    for (const definedType of [...definedTypes].sort((a, b) => a.name.localeCompare(b.name))) {
        fragment.schemas[pascal(definedType.name)] = visit(definedType.type, visitor);
    }

    return fragment;
}
