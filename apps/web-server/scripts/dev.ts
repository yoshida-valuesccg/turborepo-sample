import { spawn } from 'child_process';
import { Rollup, build } from 'vite';

let runningProcess: ReturnType<typeof spawn> | null = null;

async function start() {
    const watcher = (await build({
        configFile: 'vite.config.ts',
        mode: 'development',
        build: {
            watch: {}
        }
    })) as Rollup.RollupWatcher;

    watcher.on('event', (event) => {
        if (event.code === 'BUNDLE_END') {
            console.log('Restarting server...');
            if (runningProcess) {
                runningProcess.kill();
            }
            runningProcess = spawn('node', ['dist/index.js'], {
                stdio: 'inherit'
            });
        }
    });
}

start();
