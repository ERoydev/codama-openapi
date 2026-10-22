# Codama OpenAPI Renderer

A [Codama](https://github.com/codama-idl/codama) renderer that generates an **OpenAPI 3.0.3** spec from a Solana program IDL.

> Status: in development. Supports Anchor IDLs (Anchor 0.30+).

## What it generates

| IDL              | OpenAPI                                                         |
| ---------------- | --------------------------------------------------------------- |
| Instruction      | `POST /<program>/<instruction>` + `<Instruction>Request` schema |
| Account          | `GET /<program>/<account>/{address}` + `<Account>` schema       |
| Program metadata | `info` (title, version)                                         |

**Mapping rules**

- Instruction arguments become request body fields. The Anchor discriminator is skipped.
- Accounts the backend can resolve (PDAs, fixed addresses, program ID, payer, identity) are left out of the request. Other accounts become required `string` fields (base58).
- `u64`, `i64`, `u128` and `i128` are `string`s, to avoid precision loss in JSON. Public keys are base58 `string`s.
- Unsupported type nodes or account default values make the generator fail with an error, instead of producing a wrong spec.

## Usage

Generate a spec from an IDL:

```sh
pnpm tsx scripts/run.ts path/to/idl.json
```

Validate the result:

```sh
npx @redocly/cli lint out/openapi.yaml
```

Bundle into a single file (for code generators such as `oapi-codegen`):

```sh
npx @redocly/cli bundle out/openapi.yaml -o dist/openapi.yaml
```

### From a Codama config

In the Solana project's `codama.json`:

```json
{
    "idl": "target/idl/<program>.json",
    "scripts": {
        "openapi": {
            "from": "codama-renderer-openapi",
            "args": ["api/openapi.yaml", { "serverUrl": "http://localhost:8080" }]
        }
    }
}
```

```sh
npx codama run openapi
```

### Options

| Option        | Type     | Description                                    | Default                                        |
| ------------- | -------- | ---------------------------------------------- | ---------------------------------------------- |
| `title`       | `string` | Overrides `info.title`                         | the program name                               |
| `version`     | `string` | Overrides `info.version`                       | the program version, or `0.0.0`                |
| `description` | `string` | Overrides `info.description`                   | generated from the program name and public key |
| `serverUrl`   | `string` | Adds a `servers` entry to the spec             | omitted                                        |
| `basePath`    | `string` | Prefixes every generated path (e.g. `/api/v1`) | no prefix                                      |

## Development

```sh
pnpm install
pnpm build
pnpm lint
```

### Project structure

```
src/
├── buildOpenApi.ts      # combines fragments into the spec
├── fragments/           # one fragment per IDL section (accounts, instructions, ...)
├── visitors/            # Codama type node → OpenAPI schema
├── renderVisitor/       # Codama entry point, writes the files
└── types/               # OpenAPI 3.0.3 types
```
