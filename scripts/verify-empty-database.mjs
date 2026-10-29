import {spawn} from 'node:child_process';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const expected = [
  ['blogs', 'what-to-notice-on-your-first-franchise-visit', 'published'],
  ['industries', 'medical-industry', 'draft'],
  ['jobs', 'qa-engineer', 'draft'],
  ['jobs', 'ui-ux-designer', 'archived'],
  ['placements', 'franchises', 'published'],
];

function wrangler(args, persist) {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'wrangler', ...args, '--persist-to', persist], {
      cwd: root,
      env: {...process.env, CI: '1', WRANGLER_SEND_METRICS: 'false'},
    });
    let out = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.stderr.on('data', (chunk) => { out += chunk; });
    child.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(out))));
  });
}

function rowsFrom(output) {
  const start = output.indexOf('[');
  if (start < 0) throw new Error(output);
  const parsed = JSON.parse(output.slice(start));
  const results = parsed[0]?.results;
  if (!Array.isArray(results)) throw new Error(output);
  return results;
}

const persist = await mkdtemp(join(tmpdir(), 'ifranchise-empty-db-'));
try {
  const applied = await wrangler(['d1', 'migrations', 'apply', 'DB', '--local'], persist);
  if (!applied.includes('0000_') || !applied.includes('0002_')) throw new Error(applied);
  await wrangler(['d1', 'execute', 'DB', '--local', '--file=database/content.sql'], persist);
  let duplicateRejected = false;
  try {
    await wrangler(['d1', 'execute', 'DB', '--local', '--file=database/content.sql'], persist);
  } catch (error) {
    duplicateRejected = /UNIQUE|constraint|already exists/i.test(String(error));
  }
  if (!duplicateRejected) throw new Error('A second content.sql import was accepted.');
  const listed = rowsFrom(await wrangler(['d1', 'execute', 'DB', '--local', '--json', '--command', 'SELECT kind, slug, status FROM cms_records ORDER BY kind, slug'], persist));
  const actual = listed.map((row) => [row.kind, row.slug, row.status]);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(JSON.stringify(actual));
  const submissions = rowsFrom(await wrangler(['d1', 'execute', 'DB', '--local', '--json', '--command', 'SELECT COUNT(*) AS n FROM website_submissions'], persist));
  if (Number(submissions[0].n) !== 0) throw new Error('Seed imported submission rows.');
  console.log('Empty database: 3 migrations, 5 editorial rows, second import rejected, no submissions.');
} finally {
  await rm(persist, {recursive: true, force: true});
}
