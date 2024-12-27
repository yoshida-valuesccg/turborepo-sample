/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly CLIENT_BASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module 'process' {
    global {
        namespace NodeJS {
            interface ProcessEnv {
                readonly SERVER_LISTEN_HOST: string;
                readonly SERVER_LISTEN_PORT: string;
            }
        }
    }
}
