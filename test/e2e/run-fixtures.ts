import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { rootNodeFromAnchor } from '@codama/nodes-from-anchor';
import { visit } from '@codama/visitors-core';
import { parse } from 'yaml';

import { renderVisitor } from '../../src';

// Fixtures with a raw Anchor IDL (need converting via rootNodeFromAnchor).
const ANCHOR_IDL_FIXTURES = ['anchor', 'data_structures', 'memo', 'dummy'];
// Fixtures that are already a serialized Codama RootNode (native Solana programs ship this way).
const ROOT_NODE_FIXTURES = ['token'];

const REDOCLY_BIN = join(__dirname, '..', '..', 'node_modules', '.bin', 'redocly');
const REDOCLY_CONFIG = join(__dirname, '..', '..', 'redocly.yaml');

function runFixture(name: string, root: unknown) {
    const outDir = mkdtempSync(join(tmpdir(), `codama-e2e-${name}-`));
    const outPath = join(outDir, 'openapi.yaml');
    const defaultServerUrl = 'https://api.foo.com';

    visit(root as never, renderVisitor(outPath, { serverUrl: defaultServerUrl }));

    if (!existsSync(outPath)) {
        throw new Error(`expected ${outPath} to be written`);
    }

    const spec = parse(readFileSync(outPath, 'utf8'));
    if (!spec?.openapi || !spec?.paths || !spec?.info) {
        throw new Error('generated spec is missing openapi/info/paths');
    }

    // Resolves and validates the split paths/schemas files via their relative $refs too.
    execFileSync(REDOCLY_BIN, ['lint', outPath, '--config', REDOCLY_CONFIG], { stdio: 'inherit' });

    console.log(`[${name}] OK -> ${outPath} (${Object.keys(spec.paths).length} paths)`);
}

const fixtures = [
    ...ANCHOR_IDL_FIXTURES.map(name => ({
        load: () => rootNodeFromAnchor(JSON.parse(readFileSync(join(__dirname, name, 'idl.json'), 'utf8'))),
        name,
    })),
    ...ROOT_NODE_FIXTURES.map(name => ({
        load: () => JSON.parse(readFileSync(join(__dirname, name, 'idl.json'), 'utf8')),
        name,
    })),
];

const failures: string[] = [];

for (const { load, name } of fixtures) {
    try {
        runFixture(name, load());
    } catch (error) {
        console.error(`[${name}] FAILED: ${error instanceof Error ? error.message : String(error)}`);
        failures.push(name);
    }
}

if (failures.length > 0) {
    throw new Error(`${failures.length}/${fixtures.length} fixture(s) failed: ${failures.join(', ')}`);
}
