import {hydrateBrand} from './catalogue-fields.mjs';
import {db,CmsError} from './auth';
import {baseline,defaults} from './defaults';
import {env} from 'cloudflare:workers';
import {outboxStatement,flushEmails} from '../email/service';
import {finishDelivery} from '../intake/context';
export function recordFromRow(r:any){return {id:r.id,kind:r.kind,slug:r.slug,draft:r.kind==='franchises'?hydrateBrand(JSON.parse(r.draft)):JSON.parse(r.draft),live:r.live?JSON.parse(r.live):null,status:r.status,intent:r.intent,version:r.version,updatedBy:r.updated_by,submittedBy:r.submitted_by,updatedAt:r.updated_at};}
// Compatibility backfill runs in application storage, outside schema migrations.
async function preserveLegacyFaq(){await db().batch([
 db().prepare("INSERT OR IGNORE INTO cms_records (id,kind,slug,draft,live,status,intent,version,updated_by,submitted_by,updated_at,mutation) SELECT 'faqs:general','faqs','general',json_set(draft,'$.slug','general'),CASE WHEN live IS NULL THEN NULL ELSE json_set(live,'$.slug','general') END,status,intent,version,updated_by,submitted_by,updated_at,mutation FROM cms_records WHERE id='pages:faqs'"),
 db().prepare("UPDATE cms_events SET record_id='faqs:general' WHERE record_id='pages:faqs' AND EXISTS (SELECT 1 FROM cms_records WHERE id='faqs:general')")
]);}
export async function getRecord(id:string){if(id==='pages:faqs')id='faqs:general';if(id==='faqs:general')await preserveLegacyFaq();const row=await db().prepare('SELECT * FROM cms_records WHERE id=?').bind(id).first();if(row)return recordFromRow(row);const [kind,slug]=id.split(':');return baseline(kind,slug);}
export async function allRecords(kind:string){if(kind==='faqs')await preserveLegacyFaq();const map=new Map((defaults[kind]||[]).map(d=>[d.slug,baseline(kind,d.slug)!]));const rows=await db().prepare('SELECT * FROM cms_records WHERE kind=?').bind(kind).all();for(const row of rows.results){const r=recordFromRow(row);if(kind==='pages'&&r.slug==='faqs')continue;map.set(r.slug,r);}return [...map.values()];}
export function summary(r:any){return {id:r.id,kind:r.kind,slug:r.slug,title:r.draft.name||r.draft.title,subtitle:r.draft.category||r.draft.dept||'',image:r.draft.logo||r.draft.image||'',status:r.status,intent:r.intent,version:r.version,live:!!r.live,updatedBy:r.updatedBy,submittedBy:r.submittedBy,updatedAt:r.updatedAt};}
// Lists and dashboard counts do not need article bodies, image galleries or
// published snapshots. Project only their existing summary contract in D1.
export async function recordSummaries(kind:string){
 if(kind==='faqs')await preserveLegacyFaq();
 const map=new Map((defaults[kind]||[]).map(d=>[d.slug,summary(baseline(kind,d.slug))]));
 const rows=await db().prepare(`SELECT id,kind,slug,status,intent,version,
  COALESCE(NULLIF(json_extract(draft,'$.name'),''),json_extract(draft,'$.title')) AS title,
  COALESCE(NULLIF(json_extract(draft,'$.category'),''),NULLIF(json_extract(draft,'$.dept'),''),'') AS subtitle,
  COALESCE(NULLIF(json_extract(draft,'$.logo'),''),NULLIF(json_extract(draft,'$.image'),''),'') AS image,
  live IS NOT NULL AS live,updated_by AS updatedBy,submitted_by AS submittedBy,updated_at AS updatedAt
  FROM cms_records WHERE kind=?`).bind(kind).all();
 for(const row of rows.results){if(kind==='pages'&&row.slug==='faqs')continue;map.set(row.slug as string,{...row,title:row.title??undefined,live:!!row.live} as ReturnType<typeof summary>);}
 return [...map.values()];
}
export async function writeRecord(record:any,expected:number,actor:string,action:string,note=''){
 const mutation=crypto.randomUUID(),now=new Date().toISOString(),next={...record,version:expected+1,updatedAt:now,updatedBy:actor};
 const originalId=crypto.randomUUID(),original=expected===0?baseline(record.kind,record.slug)?.live:null;
 const notification=['submit','publish','reject','archive'].includes(action)?await outboxStatement(env,{key:'admin:'+mutation,kind:'admin',source:mutation,condition:'EXISTS (SELECT 1 FROM cms_events WHERE id=?)',values:[mutation]}):null;
 const result=await db().batch([
 db().prepare(`INSERT INTO cms_records (id,kind,slug,draft,live,status,intent,version,updated_by,submitted_by,updated_at,mutation)
 VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET draft=excluded.draft,live=excluded.live,status=excluded.status,intent=excluded.intent,version=excluded.version,updated_by=excluded.updated_by,submitted_by=excluded.submitted_by,updated_at=excluded.updated_at,mutation=excluded.mutation WHERE cms_records.version=?`).bind(next.id,next.kind,next.slug,JSON.stringify(next.draft),next.live?JSON.stringify(next.live):null,next.status,next.intent,next.version,actor,next.submittedBy||null,now,mutation,expected),
 ...(original?[db().prepare('INSERT INTO cms_events (id,record_id,action,actor,snapshot,note,created_at) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM cms_records WHERE id=? AND mutation=?)').bind(originalId,next.id,'original version',actor,JSON.stringify(original),'',new Date(Date.now()-1).toISOString(),next.id,mutation)]:[]),
 db().prepare('INSERT INTO cms_events (id,record_id,action,actor,snapshot,note,created_at) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM cms_records WHERE id=? AND mutation=?)').bind(mutation,next.id,action,actor,JSON.stringify(next.draft),note,now,next.id,mutation),
 ...(notification?[notification.statement]:[])
 ]);
 if(!result[0].meta.changes)throw new CmsError(409,'Someone changed this item. Reload it before saving your changes.');
 if(notification)await finishDelivery(flushEmails(env));
 return next;
}
