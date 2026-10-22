const assert = require('node:assert');

const { renderVisitor } = require('../../dist/index.cjs');

const visitor = renderVisitor('out/openapi.yaml');
assert.strictEqual(typeof visitor.visitRoot, 'function');
