import type { DefinedTypeNode } from '@codama/nodes';
import { visit } from '@codama/visitors-core';

import type { SchemaObject } from '../types';
import { pascal } from '../utils';
import { getSchemaVisitor } from '../visitors';

export function getDefinedTypeFragment(definedTypes: readonly DefinedTypeNode[] = []): Record<string, SchemaObject> {
    const visitor = getSchemaVisitor();
    const schemas: Record<string, SchemaObject> = {};

    for (const definedType of [...definedTypes].sort((a, b) => a.name.localeCompare(b.name))) {
        schemas[pascal(definedType.name)] = visit(definedType.type, visitor);
    }

    return schemas;
}
