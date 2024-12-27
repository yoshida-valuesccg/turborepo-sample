/// <reference types="vitest" />

import { envPlugin } from '@repo/env-plugin';
import { runtimePackagePlugin } from '@repo/runtime-package-plugin';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    return {
        mode,
        plugins: [
            runtimePackagePlugin(),
            envPlugin({
                prefix: 'SERVER_'
            })
        ],
        build: {
            target: 'esnext',
            lib: {
                entry: path.resolve(process.cwd(), './src/index.ts'),
                fileName: 'index',
                formats: ['es']
            },
            outDir: path.resolve(process.cwd(), './dist')
        },
        optimizeDeps: {
            exclude: ['node_modules']
        },
        define: {
            'import.meta.vitest': 'undefined'
        },
        test: {
            testTimeout: 60 * 1000 * 5,
            setupFiles: ['./setup.ts'],
            includeSource: ['**/*.?(c|m)[jt]s?(x)']
        }
    };
});
