import {
    accountNode,
    definedTypeNode,
    instructionArgumentNode,
    instructionNode,
    numberTypeNode,
    programNode,
    publicKeyTypeNode,
    rootNode,
    structFieldTypeNode,
    structTypeNode,
} from '@codama/nodes';
import { expect, test } from 'vitest';

import { buildOpenApi } from '../src/buildOpenApiDocument';
import { isReference } from '../src/types';

const program = programNode({
    accounts: [
        accountNode({
            data: structTypeNode([structFieldTypeNode({ name: 'owner', type: publicKeyTypeNode() })]),
            name: 'vault',
        }),
    ],
    definedTypes: [definedTypeNode({ name: 'feeBps', type: numberTypeNode('u16') })],
    instructions: [
        instructionNode({
            arguments: [instructionArgumentNode({ name: 'amount', type: numberTypeNode('u64') })],
            name: 'deposit',
        }),
    ],
    name: 'vaultExample',
    publicKey: '11111111111111111111111111111111',
    version: '1.2.3',
});
const root = rootNode(program);

test('it defaults title/version/description from the program and omits servers', () => {
    const { spec } = buildOpenApi(root);

    expect(spec.info).toEqual({
        description: 'REST API for the vaultExample Solana program (11111111111111111111111111111111).',
        title: 'vaultExample',
        version: '1.2.3',
        'x-program-id': '11111111111111111111111111111111',
    });
    expect(spec.servers).toBeUndefined();
});

test('it lets options override title, version, description and adds a servers entry', () => {
    const { spec } = buildOpenApi(root, {
        description: 'Custom description',
        serverUrl: 'https://api.example.com',
        title: 'Custom Title',
        version: '9.9.9',
    });

    expect(spec.info.title).toBe('Custom Title');
    expect(spec.info.version).toBe('9.9.9');
    expect(spec.info.description).toBe('Custom description');
    expect(spec.servers).toEqual([{ url: 'https://api.example.com' }]);
});

test('it falls back to 0.0.0 when the program has no version and none is given in options', () => {
    // programNode() always defaults `version`, so simulate an IDL source that omits it entirely.
    const unversioned = rootNode({
        ...programNode({ name: 'bare', publicKey: '11111111111111111111111111111111' }),
        version: undefined,
    } as never);

    const { spec } = buildOpenApi(unversioned);

    expect(spec.info.version).toBe('0.0.0');
});

test('it merges schemas from defined types, accounts and instructions', () => {
    const { spec } = buildOpenApi(root);

    expect(Object.keys(spec.components!.schemas!).sort()).toEqual(['DepositRequest', 'FeeBps', 'Vault']);
});

test('it leaves paths unprefixed when no basePath is given', () => {
    const { spec } = buildOpenApi(root);

    expect(Object.keys(spec.paths)).toEqual(
        expect.arrayContaining(['/vaultExample/vault/{address}', '/vaultExample/deposit']),
    );
});

test('it prefixes every path with a normalized basePath', () => {
    const { spec } = buildOpenApi(root, { basePath: '/api/v1/' });

    expect(Object.keys(spec.paths)).toEqual(
        expect.arrayContaining(['/api/v1/vaultExample/vault/{address}', '/api/v1/vaultExample/deposit']),
    );
});

test('it normalizes a basePath regardless of surrounding slashes', () => {
    const withSlashes = buildOpenApi(root, { basePath: '/api/v1/' }).spec;
    const withoutSlashes = buildOpenApi(root, { basePath: 'api/v1' }).spec;

    expect(Object.keys(withSlashes.paths).sort()).toEqual(Object.keys(withoutSlashes.paths).sort());
});

test('it lets an account schema win over a defined type of the same name, since accounts are spread in later', () => {
    const colliding = rootNode(
        programNode({
            accounts: [accountNode({ data: structTypeNode([]), name: 'feeBps' })],
            definedTypes: [definedTypeNode({ name: 'feeBps', type: numberTypeNode('u16') })],
            name: 'vaultExample',
            publicKey: '11111111111111111111111111111111',
        }),
    );

    const { schemaFiles } = buildOpenApi(colliding);

    expect(schemaFiles['schemas/FeeBps.yaml']).toEqual({ properties: {}, type: 'object' });
});

test('it splits paths and schemas out into their own files and refs them', () => {
    const { pathFiles, schemaFiles, spec } = buildOpenApi(root);

    expect(Object.keys(pathFiles).length).toBeGreaterThan(0);
    expect(Object.keys(schemaFiles).length).toBeGreaterThan(0);

    expect(spec.paths['/vaultExample/deposit'].$ref).toMatch(/^\.\/paths\//);

    const vaultSchema = spec.components!.schemas!.Vault;
    if (!isReference(vaultSchema)) throw new Error('expected Vault schema to be a $ref');
    expect(vaultSchema.$ref).toMatch(/^\.\/schemas\//);
});
