import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outfile = join(root, '.wrangler/qa/sheets-delivery.mjs');
await mkdir(join(root, '.wrangler/qa'), {recursive: true});

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {cwd: root, stdio: 'inherit'});
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`))));
  });
}

await run('pnpm', ['exec', 'esbuild', 'tests/sheets-delivery.mjs', '--bundle', '--platform=node', '--format=esm', `--outfile=${outfile}`, `--alias:cloudflare:workers=${join(root, 'tests/cloudflare-workers-stub.mjs')}`, `--alias:next/headers=${join(root, 'tests/next-headers-stub.mjs')}`]);
await run('node', ['--test', outfile]);
