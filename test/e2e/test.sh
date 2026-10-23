#!/usr/bin/env bash
set -ux

status=0

# Real "codama.json project" path: exercises the published package end-to-end via the codama CLI.
(cd test/e2e/system && pnpm install && pnpm test) || status=1

# Everything else: drive the renderer directly against each fixture IDL.
pnpm tsx test/e2e/run-fixtures.ts || status=1

exit $status
