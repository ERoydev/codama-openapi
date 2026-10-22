import { readFileSync } from 'node:fs';
import { rootNodeFromAnchor } from '@codama/nodes-from-anchor';
import { visit } from '@codama/visitors-core';
import { renderVisitor } from '../src';

const idl = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const root = rootNodeFromAnchor(idl);
// console.log(JSON.stringify(root.program.instructions, null, 2));
visit(
    root,
    renderVisitor('out/openapi.yaml', {
        basePath: '/api/v1',
        description: 'Test description for RenderOptions wiring',
        serverUrl: 'https://api.foo.com',
        title: 'Test Title',
        version: '9.9.9',
    }),
);
