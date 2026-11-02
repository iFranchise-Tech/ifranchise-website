import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
for(const dev of [true,false])test(`transactional email integration (${dev?'development':'production'} build)`,async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ifranchise-email-'));
 try{
  const outfile=join(dir,'test.mjs');
  await build({entryPoints:['tests/email-runtime.mjs'],bundle:true,platform:'node',format:'esm',outfile,logLevel:'silent',define:{'import.meta.env.DEV':String(dev)},alias:{'cloudflare:workers':resolve('tests/cloudflare-workers-stub.mjs'),'next/headers':resolve('tests/cms-auth-headers.mjs')}});
  const result=execFileSync(process.execPath,[outfile],{encoding:'utf8',timeout:45000});assert.match(result,/PASS email integration/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
