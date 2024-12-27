import fs from 'fs';
import path from 'path';
import { Plugin, loadEnv } from 'vite';

function findMonorepoRoot() {
    let currentPath = process.cwd();
    while (
        !fs.existsSync(path.join(currentPath, 'package.json')) ||
        !hasWorkspaces(path.join(currentPath, 'package.json'))
    ) {
        const parentPath = path.resolve(currentPath, '..');
        if (parentPath === '/') {
            throw new Error('Monorepo root not found');
        }
        currentPath = parentPath;
    }
    return currentPath;
}

function hasWorkspaces(packageJsonPath: string): boolean {
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        return !!packageJson.workspaces;
    } catch {
        return false;
    }
}

export const envPlugin = (args: { prefix: string }): Plugin => {
    return {
        name: 'env-plugin',
        config(config, env) {
            const monorepoRootPath = findMonorepoRoot();
            const envValues = loadEnv(env.mode, monorepoRootPath, args.prefix);
            const defineValues = Object.fromEntries([
                ...Object.entries(envValues).flatMap(([key, value]) => [
                    [`process.env.${key}`, JSON.stringify(value)],
                    [`import.meta.env.${key}`, JSON.stringify(value)]
                ])
            ]);

            config.define = {
                ...(config.define ?? {}),
                ...defineValues
            };
        }
    };
};
