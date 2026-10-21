# Codama OpenAPI Renderer

A [Codama](https://github.com/codama-idl/codama) renderer that turns a Solana program IDL into an OpenAPI 3.0.3 spec.

## Usage

```sh
pnpm tsx scripts/run.ts path/to/idl.json
```

```sh
npx @redocly/cli lint out/openapi.yaml
```

This generates `out/openapi.yaml`, with each path split into its own file under `out/paths/`.

## Development

```sh
pnpm install
pnpm build
```
