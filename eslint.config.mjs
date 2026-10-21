import solanaConfig from '@solana/eslint-config-solana';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    { ignores: ['**/dist/**', '**/e2e/**', 'scripts/**'] },
    {
        files: ['**/*.ts', '**/*.(c|m)?js'],
        extends: [solanaConfig],
        rules: {
            // Keep keys in the order we write them (OpenAPI order), don't sort alphabetically
            'sort-keys-fix/sort-keys-fix': 'off',
        },
    },
]);
