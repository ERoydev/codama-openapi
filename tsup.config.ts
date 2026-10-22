import { defineConfig, Format, Options as TsupConfig } from 'tsup';

export default defineConfig([getBuildConfig('cjs'), getBuildConfig('esm')]);

function getBuildConfig(format: Format): TsupConfig {
    return {
        entry: [`./src/index.ts`],
        esbuildOptions(options) {
            options.define = { ...options.define, 'process.env.NODE_ENV': 'process.env.NODE_ENV' };
        },
        format,
        outExtension({ format }) {
            return { js: format === 'cjs' ? '.cjs' : '.mjs' };
        },
        platform: 'node',
        publicDir: true,
        pure: ['process'],
        sourcemap: true,
        treeshake: true,
    };
}
