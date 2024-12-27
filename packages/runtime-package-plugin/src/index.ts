import fs from 'fs';
import { builtinModules, createRequire } from 'module';
import path from 'path';
import { Plugin } from 'vite';

// Set of Node.js built-in modules
const builtins = new Set(builtinModules);

// Retrieve module search searchPaths from the base path
function getModuleSearchPaths(basePath: string): string[] {
    const requireFromPath = createRequire(path.join(basePath, 'package.json'));
    const searchPaths = requireFromPath.resolve.paths('') || [];
    return searchPaths.filter(Boolean);
}

// Class to manage a list of modules with their versions and export searchPaths
class ModuleList {
    modules = new Map<string, { version: string; exportPaths: string[] }>();

    addModule(moduleName: string, packageJson: any) {
        const version = packageJson.version;
        const exportPaths: string[] = [];
        if (packageJson.exports) {
            Object.keys(packageJson.exports).forEach((key) => {
                if (key.startsWith('./')) {
                    exportPaths.push(key.replace(/^\.\//, ''));
                }
            });
        }
        this.modules.set(moduleName, { version, exportPaths });
    }

    getFlatModules() {
        const flatModules = new Map<string, string>();
        this.modules.forEach(({ version, exportPaths }, moduleName) => {
            flatModules.set(moduleName, moduleName);
            exportPaths.forEach((exportPath) => {
                flatModules.set(`${moduleName}/${exportPath}`, moduleName);
            });
        });
        return flatModules;
    }
}

// Recursively find modules in given searchPaths
function findModulesInPaths(searchPaths: string[]) {
    const moduleList = new ModuleList();

    const findModulesRecursively = (directory: string, parentPath = '') => {
        if (!fs.existsSync(directory)) return;

        const entries = fs.readdirSync(directory);
        for (const entry of entries) {
            const entryPath = path.join(directory, entry);
            const packageJsonPath = path.join(entryPath, 'package.json');

            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                if (!packageJson.private) {
                    const moduleName = parentPath ? `${parentPath}/${entry}` : entry;
                    moduleList.addModule(moduleName, packageJson);
                }
            }

            if (entry !== 'node_modules' && fs.existsSync(entryPath) && fs.statSync(entryPath).isDirectory()) {
                findModulesRecursively(entryPath, parentPath ? `${parentPath}/${entry}` : entry);
            }
        }
    };

    searchPaths.forEach((searchPath) => findModulesRecursively(searchPath));
    return moduleList;
}

// Vite plugin to mark external dependencies and generate a custom package.json
export function runtimePackagePlugin(args?: { exclude?: string[] }): Plugin {
    const { exclude } = args ?? {};
    const usedModules = new Set<string>();
    const projectRoot = path.resolve(process.cwd());
    const moduleSearchPaths = getModuleSearchPaths(projectRoot);
    const moduleList = findModulesInPaths(moduleSearchPaths);
    const flatModules = moduleList.getFlatModules();

    return {
        name: 'node-runtime-package-plugin',
        buildStart() {
            usedModules.clear();
        },
        buildEnd() {
            const currentPackageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

            const pkg: Record<string, any> = {
                type: currentPackageJson.type,
                name: currentPackageJson.name,
                version: currentPackageJson.version,
                dependencies: {} as Record<string, string>
            };

            if (currentPackageJson.config) {
                pkg.config = currentPackageJson.config;
            }

            usedModules.forEach((moduleName) => {
                const module = moduleList.modules.get(moduleName);
                if (module) {
                    pkg.dependencies[moduleName] = module.version;
                }
            });

            pkg.dependencies = Object.keys(pkg.dependencies)
                .sort()
                .reduce((sortedDeps, key) => {
                    sortedDeps[key] = pkg.dependencies[key];
                    return sortedDeps;
                }, {} as Record<string, string>);

            fs.writeFileSync('./package.runtime.json', JSON.stringify(pkg, null, 4));
        },
        config(config, { command }) {
            if (command === 'build') {
                config.build = config.build || {};
                config.build.rollupOptions = config.build.rollupOptions || {};
                config.build.rollupOptions.external = (source) => {
                    if (builtins.has(source)) {
                        return true;
                    }

                    if (flatModules.has(source)) {
                        usedModules.add(flatModules.get(source)!);
                        return true;
                    }

                    if (source.startsWith('node:')) {
                        return true;
                    }

                    if (exclude?.includes(source)) {
                        return true;
                    }

                    return false;
                };
            }
        }
    };
}
