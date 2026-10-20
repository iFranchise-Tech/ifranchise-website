import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const base='http://127.0.0.1:3028',h={'oai-authenticated-user-email':'preview@ifranchise.in','oai-authenticated-user-id':'local_seedy',Origin:base};
async function upload(file,status){const f=new FormData();f.set('scope','articles');f.set('file',file);const r=await fetch(base+'/api/admin/upload',{method:'POST',headers:h,body:f});const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d;}
await upload(new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'],'bad.svg',{type:'image/svg+xml'}),422);
await upload(new File([new Uint8Array(8*1024*1024+1)],'big.png',{type:'image/png'}),422);
const image=await readFile('public/art/natural/articles/what-is-a-franchise.webp');const m=await upload(new File([image],'qa-cover.webp',{type:'image/webp'}),200);
assert.equal((await fetch(base+m.url)).status,404);assert.equal((await fetch(base+m.url,{headers:h})).status,200);
async function api(path='',body){const res=await fetch(base+'/api/admin'+path,{method:body?'POST':'GET',headers:{...h,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const d=await res.json();assert.equal(res.status,200,JSON.stringify(d));return d;}
let r=(await api('?id=articles:what-is-a-franchise')).record,old=r.draft;
for(const action of ['save','submit','publish'])r=(await api('',{action,kind:r.kind,slug:r.slug,version:r.version,...(action==='save'?{payload:{...old,image:m.url}}:{})})).record;
assert.equal((await fetch(base+m.url)).status,200);
for(const action of ['save','submit','publish'])r=(await api('',{action,kind:r.kind,slug:r.slug,version:r.version,...(action==='save'?{payload:old}:{})})).record;
assert.equal((await fetch(base+m.url)).status,404);
console.log('PASS: bounded uploads, active-content rejection, protected draft files, published media availability, removal of public file access after unpublishing.');
