import {db,CmsError} from './auth';
import {baseline,defaults} from './defaults';
export function recordFromRow(r:any){return {id:r.id,kind:r.kind,slug:r.slug,draft:JSON.parse(r.draft),live:r.live?JSON.parse(r.live):null,status:r.status,intent:r.intent,version:r.version,updatedBy:r.updated_by,submittedBy:r.submitted_by,updatedAt:r.updated_at};}
export async function getRecord(id:string){const row=await db().prepare('SELECT * FROM cms_records WHERE id=?').bind(id).first();if(row)return recordFromRow(row);const [kind,slug]=id.split(':');return baseline(kind,slug);}
export async function allRecords(kind:string){const map=new Map((defaults[kind]||[]).map(d=>[d.slug,baseline(kind,d.slug)!]));const rows=await db().prepare('SELECT * FROM cms_records WHERE kind=?').bind(kind).all();for(const row of rows.results){const r=recordFromRow(row);map.set(r.slug,r);}return [...map.values()];}
export function summary(r:any){return {id:r.id,kind:r.kind,slug:r.slug,title:r.draft.name||r.draft.title,subtitle:r.draft.category||r.draft.dept||'',image:r.draft.logo||r.draft.image||'',status:r.status,intent:r.intent,version:r.version,live:!!r.live,updatedBy:r.updatedBy,submittedBy:r.submittedBy,updatedAt:r.updatedAt};}
export async function writeRecord(record:any,expected:number,actor:string,action:string,note=''){
 const mutation=crypto.randomUUID(),now=new Date().toISOString(),next={...record,version:expected+1,updatedAt:now,updatedBy:actor};
 const originalId=crypto.randomUUID(),original=expected===0?baseline(record.kind,record.slug)?.live:null;
 const result=await db().batch([
 db().prepare(`INSERT INTO cms_records (id,kind,slug,draft,live,status,intent,version,updated_by,submitted_by,updated_at,mutation)
 VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET draft=excluded.draft,live=excluded.live,status=excluded.status,intent=excluded.intent,version=excluded.version,updated_by=excluded.updated_by,submitted_by=excluded.submitted_by,updated_at=excluded.updated_at,mutation=excluded.mutation WHERE cms_records.version=?`).bind(next.id,next.kind,next.slug,JSON.stringify(next.draft),next.live?JSON.stringify(next.live):null,next.status,next.intent,next.version,actor,next.submittedBy||null,now,mutation,expected),
 ...(original?[db().prepare('INSERT INTO cms_events (id,record_id,action,actor,snapshot,note,created_at) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM cms_records WHERE id=? AND mutation=?)').bind(originalId,next.id,'original version',actor,JSON.stringify(original),'',new Date(Date.now()-1).toISOString(),next.id,mutation)]:[]),
 db().prepare('INSERT INTO cms_events (id,record_id,action,actor,snapshot,note,created_at) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM cms_records WHERE id=? AND mutation=?)').bind(mutation,next.id,action,actor,JSON.stringify(next.draft),note,now,next.id,mutation)
 ]);
 if(!result[0].meta.changes)throw new CmsError(409,'Someone changed this item. Reload it before saving your changes.');
 return next;
}
