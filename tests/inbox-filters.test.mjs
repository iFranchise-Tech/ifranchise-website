import test from 'node:test';
import assert from 'node:assert/strict';
import {inboxFilters} from '../lib/intake/inbox-filters.mjs';
import {localD1} from './local-d1.mjs';

test('Inbox filters are optional and combine using bound parameters', () => {
  assert.deepEqual(inboxFilters(new URLSearchParams()), {clause:'',values:[]});
  const filter=inboxFilters(new URLSearchParams({type:'job',received:'2026-11-02',sync:'pending'}));
  assert.deepEqual(filter.values,['job','2026-11-01T18:30:00.000Z','2026-11-02T18:30:00.000Z','pending']);
  assert.equal((filter.clause.match(/\?/g)||[]).length,4);
  assert(!filter.clause.includes('2026'));
});

test('Inbox filters reject unknown types, statuses, impossible dates and SQL input', () => {
  for(const value of ['unknown',"job' OR 1=1 --"]){
    assert.throws(()=>inboxFilters(new URLSearchParams({type:value})),/submission type/);
    assert.throws(()=>inboxFilters(new URLSearchParams({sync:value})),/sync status/);
  }
  for(const received of ['2026-02-29','2026-02-30','2026-13-01','2026-1-02','not-a-date',"2026-11-02' OR 1=1"])
    assert.throws(()=>inboxFilters(new URLSearchParams({received})),/received date/);
  assert.doesNotThrow(()=>inboxFilters(new URLSearchParams({received:'2024-02-29'})));
});

test('Received day uses IST midnight and an exclusive end; private requests stay separate',()=>{
  const {database}=localD1();
  try{
    database.exec('CREATE TABLE submissions(id TEXT, kind TEXT, created_at TEXT, sheet_status TEXT)');
    const insert=database.prepare('INSERT INTO submissions VALUES (?,?,?,?)');
    insert.run('before','job','2026-11-01T18:29:59.999Z','pending');
    insert.run('start','job','2026-11-01T18:30:00.000Z','pending');
    insert.run('last','job','2026-11-02T18:29:59.999Z','synced');
    insert.run('next','job','2026-11-02T18:30:00.000Z','pending');
    insert.run('private','privacy','2026-11-02T08:00:00.000Z','not_applicable');
    const ids=params=>{const f=inboxFilters(new URLSearchParams(params));return database.prepare('SELECT id FROM submissions WHERE 1=1'+f.clause+' ORDER BY id').all(...f.values).map(r=>r.id)};
    assert.deepEqual(ids({received:'2026-11-02'}),['last','private','start']);
    assert.deepEqual(ids({received:'2026-11-02',type:'job',sync:'pending'}),['start']);
    assert.deepEqual(ids({received:'2026-11-02',sync:'synced'}),['last']);
    assert.deepEqual(ids({sync:'private'}),['private']);
    assert.deepEqual(ids({sync:'pending',type:'privacy'}),[]);
  }finally{database.close()}
});
