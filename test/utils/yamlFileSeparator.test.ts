import { expect, test } from 'vitest';

import { yamlFileSeparator } from '../../src/utils';

test('it splits each entry into its own file and points a ref at it', () => {
    const schemas = { Vault: { properties: { owner: { type: 'string' } }, type: 'object' } };

    const { files, refs } = yamlFileSeparator(schemas, 'schemas');

    expect(files).toEqual({ 'schemas/Vault.yaml': schemas.Vault });
    expect(refs).toEqual({ Vault: { $ref: './schemas/Vault.yaml' } });
});

test('it strips curly braces from path parameter segments when building the file path', () => {
    const paths = { '/vaultExample/vault/{address}': { get: {} } };

    const { files, refs } = yamlFileSeparator(paths, 'paths');

    expect(files).toEqual({ 'paths/vaultExample/vault/address.yaml': { get: {} } });
    expect(refs).toEqual({ '/vaultExample/vault/{address}': { $ref: './paths/vaultExample/vault/address.yaml' } });
});

test('it rewrites internal component $refs to point back at the main openapi.yaml, relative to the split file', () => {
    const schemas = { Vault: { properties: { owner: { $ref: '#/components/schemas/Owner' } } } };

    const { files } = yamlFileSeparator(schemas, 'schemas');

    expect(files['schemas/Vault.yaml']).toEqual({
        properties: { owner: { $ref: '../openapi.yaml#/components/schemas/Owner' } },
    });
});

test('it adds one extra ../ per path segment when rewriting refs for deeper keys', () => {
    const paths = { '/vaultExample/vault/{address}': { get: { schema: { $ref: '#/components/schemas/Vault' } } } };

    const { files } = yamlFileSeparator(paths, 'paths');

    expect(files['paths/vaultExample/vault/address.yaml']).toEqual({
        get: { schema: { $ref: '../../../openapi.yaml#/components/schemas/Vault' } },
    });
});

test('it separates multiple entries independently', () => {
    const schemas = {
        FeeBps: { type: 'integer' },
        Vault: { properties: {}, type: 'object' },
    };

    const { files, refs } = yamlFileSeparator(schemas, 'schemas');

    expect(Object.keys(files).sort()).toEqual(['schemas/FeeBps.yaml', 'schemas/Vault.yaml']);
    expect(refs).toEqual({
        FeeBps: { $ref: './schemas/FeeBps.yaml' },
        Vault: { $ref: './schemas/Vault.yaml' },
    });
});

test('it returns empty files and refs for an empty fragment', () => {
    expect(yamlFileSeparator({}, 'schemas')).toEqual({ files: {}, refs: {} });
});

test('it normalizes a trailing slash on the prefix instead of producing a double slash', () => {
    const { files } = yamlFileSeparator({ Vault: { type: 'object' } }, 'schemas/');

    expect(files).toEqual({ 'schemas/Vault.yaml': { type: 'object' } });
});
