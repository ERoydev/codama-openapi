// This ensures that we do not rely on `__dirname` in ES modules even when it is polyfilled.
globalThis.__dirname = 'DO_NOT_USE';

import assert from 'node:assert';

import { renderVisitor } from '../../dist/index.mjs';

const visitor = renderVisitor('out/openapi.yaml');
assert.strictEqual(typeof visitor.visitRoot, 'function');
