/// <reference types="vitest" />

import { envPlugin } from '@repo/env-plugin';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig(({ mode }) => {
    return {
        mode,
        plugins: [
            /*
            Uncomment the following line to enable solid-devtools.
            For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
            */
            // devtools(),
            solidPlugin(),
            envPlugin({
                prefix: 'CLIENT_'
            })
        ],
        server: {
            port: 3000,
            proxy: {
                '/api': {
                    target: 'http://localhost:4000',
                    changeOrigin: true,
                    http2: true
                }
            }
        },
        build: {
            target: 'esnext'
        },
        define: {
            'import.meta.vitest': 'undefined'
        },
        test: {
            includeSource: ['**/*.?(c|m)[jt]s?(x)']
        }
    };
});
