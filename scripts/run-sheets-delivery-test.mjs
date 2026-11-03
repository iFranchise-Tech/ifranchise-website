import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outfile = join(root, '.wrangler/qa/sheets-delivery.mjs');
await mkdir(join(root, '.wrangler/qa'), {recursive: true});

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {cwd: root, stdio: 'inherit'});
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`))));
  });
}

await build({
  absWorkingDir: root, entryPoints: ['tests/sheets-delivery.mjs'], outfile,
  bundle: true, platform: 'node', format: 'esm',
  define: {'import.meta.env.DEV': 'true'},
  alias: {'cloudflare:workers': join(root, 'tests/cloudflare-workers-stub.mjs'), 'next/headers': join(root, 'tests/next-headers-stub.mjs')},
});
await run(process.execPath, ['--test', outfile]);
