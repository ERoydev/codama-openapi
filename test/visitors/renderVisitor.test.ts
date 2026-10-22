import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
    accountNode,
    instructionArgumentNode,
    instructionNode,
    numberTypeNode,
    programNode,
    publicKeyTypeNode,
    rootNode,
    structFieldTypeNode,
    structTypeNode,
} from '@codama/nodes';
import { visit } from '@codama/visitors-core';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { parse } from 'yaml';

import { OpenAPIObject } from '../../src/types';
import { renderVisitor } from '../../src/visitors/renderVisitor';

const root = rootNode(
    programNode({
        accounts: [
            accountNode({
                data: structTypeNode([structFieldTypeNode({ name: 'owner', type: publicKeyTypeNode() })]),
                name: 'vault',
            }),
        ],
        instructions: [
            instructionNode({
                arguments: [instructionArgumentNode({ name: 'amount', type: numberTypeNode('u64') })],
                name: 'deposit',
            }),
        ],
        name: 'vaultExample',
        publicKey: '11111111111111111111111111111111',
        version: '1.0.0',
    }),
);

let dir: string;

beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'codama-renderer-openapi-'));
});

afterEach(() => {
    rmSync(dir, { force: true, recursive: true });
});

function readSpec(path: string): OpenAPIObject {
    return parse(readFileSync(path, 'utf8')) as OpenAPIObject;
}

test('it writes the main openapi.yaml plus one file per split path and schema', () => {
    const outPath = join(dir, 'api', 'openapi.yaml');

    visit(root, renderVisitor(outPath));

    expect(existsSync(outPath)).toBe(true);

    const spec = readSpec(outPath);
    expect(spec.info.title).toBe('vaultExample');
    expect(spec.paths['/vaultExample/deposit'].$ref).toMatch(/^\.\/paths\//);
    expect(spec.components!.schemas!.Vault).toHaveProperty('$ref');

    expect(existsSync(join(dir, 'api', 'paths', 'vaultExample', 'deposit.yaml'))).toBe(true);
    expect(existsSync(join(dir, 'api', 'schemas', 'Vault.yaml'))).toBe(true);
});

test('it applies RenderOptions such as a custom title and basePath', () => {
    const outPath = join(dir, 'api', 'openapi.yaml');

    visit(root, renderVisitor(outPath, { basePath: '/v1', title: 'Custom Title' }));

    const spec = readSpec(outPath);
    expect(spec.info.title).toBe('Custom Title');
    expect(Object.keys(spec.paths)).toContain('/v1/vaultExample/deposit');
});

test('it clears a previously rendered output directory before writing', () => {
    const outDir = join(dir, 'api');
    const outPath = join(outDir, 'openapi.yaml');

    visit(root, renderVisitor(outPath));
    const stalePath = join(outDir, 'stale.txt');
    writeFileSync(stalePath, 'stale');

    visit(root, renderVisitor(outPath));

    expect(existsSync(stalePath)).toBe(false);
    expect(existsSync(outPath)).toBe(true);
});
