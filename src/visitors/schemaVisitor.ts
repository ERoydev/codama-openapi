import { extendVisitor, staticVisitor, visit } from '@codama/visitors-core';
import { REGISTERED_TYPE_NODE_KINDS } from '@codama/nodes';
import { pascal } from '../utils';
import { SchemaObject } from '../types';

// Visitor turns one Codama type node into an OpenAPI schema
export function getSchemaVisitor() {
    // Default for any type that is not handled: fail loudly
    const base = staticVisitor<SchemaObject>(
        node => {
            throw new Error(`Unsupported type node "${node.kind}"`);
        },
        { keys: [...REGISTERED_TYPE_NODE_KINDS, 'structFieldTypeNode', 'definedTypeLinkNode'] },
    );

    return extendVisitor(base, {
        visitStructType(node, { self }) {
            const properties: Record<string, SchemaObject> = {};
            const required: string[] = [];

            for (const field of node.fields ?? []) {
                if (field.defaultValueStrategy === 'omitted') continue; // discriminator

                properties[field.name] = visit(field.type, self);
                required.push(field.name);
            }
            return { type: 'object', properties, required };
        },
        visitNumberType(node) {
            return ['u64', 'i64', 'u128', 'i128'].includes(node.format)
                ? { type: 'string', pattern: '^-?[0-9]+$' }
                : { type: 'integer' };
        },
        visitPublicKeyType: () => ({ type: 'string', description: 'base58 public key' }),
        visitBooleanType: () => ({ type: 'boolean' }),
        visitStringType: () => ({ type: 'string' }),
        visitDefinedTypeLink: node => ({ $ref: `#/components/schemas/${pascal(node.name)}` }),
        visitSizePrefixType: (node, { self }) => visit(node.type, self),
        visitFixedSizeType: (node, { self }) => visit(node.type, self),
    });
}