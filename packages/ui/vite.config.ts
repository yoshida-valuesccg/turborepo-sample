/// <reference types="vitest" />

import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    return {
        mode,
        plugins: [],
        build: {
            target: 'esnext',
            lib: {
                entry: path.resolve(process.cwd(), './index.tsx'),
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
