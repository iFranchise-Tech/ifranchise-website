import {auditIntake} from '../../../../lib/intake/audit';
import {jsonBody} from '../../../../lib/intake/server';
import {adminIdentity,assertOrigin,db,response,CmsError,failure} from '../../../../lib/cms/auth';
import {canEdit,canView} from '../../../../lib/cms/policy.mjs';
import {deliver} from '../../../../lib/intake/server';
import {canViewSubmission,publicRecord} from '../../../../lib/intake/access';
import {inboxFilters} from '../../../../lib/intake/inbox-filters.mjs';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{
 const me=await adminIdentity();
 if(!canView(me,'enquiries')&&!canView(me,'applications'))throw new CmsError(403,'You do not have access to submissions.');
 const p=new URL(req.url).searchParams,id=p.get('id');
 if(id){const row:any=await db().prepare('SELECT * FROM website_submissions WHERE id=?').bind(id).first();if(!row||!canViewSubmission(me,row.kind))throw new CmsError(404,'Submission unavailable.');await auditIntake(me.email,row.id,'view submission');return response({record:publicRecord(row)});}
 const page=Math.max(1,Math.min(10000,Math.floor(Number(p.get('page')))||1));
 const allowed=me.role==='super_admin'?'1=1':canView(me,'enquiries')&&canView(me,'applications')?"kind!='privacy'":canView(me,'applications')?"kind='job'":"kind NOT IN ('job','privacy')";
 let filters;try{filters=inboxFilters(p)}catch(e){throw new CmsError(422,e instanceof Error?e.message:'Choose valid Inbox filters.')}
 const clause='('+allowed+')'+filters.clause;
 const count=db().prepare('SELECT COUNT(*) AS count FROM website_submissions WHERE '+clause);
 const total:any=await (filters.values.length?count.bind(...filters.values):count).first();
 const rows=await db().prepare('SELECT * FROM website_submissions WHERE '+clause+' ORDER BY created_at DESC,id DESC LIMIT 25 OFFSET ?').bind(...filters.values,(page-1)*25).all();
 await auditIntake(me.email,'list','view submissions',rows.results.map((r:any)=>r.id).join(','));
 return response({records:rows.results.map(publicRecord),page,total:total.count});
}catch(e){return failure(e)}}
export async function POST(req:Request){try{assertOrigin(req);const me=await adminIdentity();if(!canEdit(me,'enquiries')&&!canEdit(me,'applications'))throw new CmsError(403,'You cannot sync submissions.');const kinds=canEdit(me,'enquiries')&&canEdit(me,'applications')?"kind IN ('investor','brand','general','job')":canEdit(me,'applications')?"kind='job'":"kind IN ('investor','brand','general')";const rows=await db().prepare("SELECT * FROM website_submissions WHERE sheet_status='pending' AND "+kinds+" ORDER BY created_at,id LIMIT 5").all();const result=await Promise.all(rows.results.map(r=>deliver(r,new URL(req.url).origin)));return response({synced:result.filter(Boolean).length,pending:result.filter(v=>!v).length});}catch(e){return failure(e)}}

export async function PATCH(req:Request){try{assertOrigin(req);const me=await adminIdentity();if(me.role!=='super_admin')throw new CmsError(403,'Only the administrator can handle privacy requests.');const p=await jsonBody(req);if(!['Received','Awaiting verification','In progress','Completed'].includes(p.status))throw new CmsError(422,'Choose a request status.');if(p.status==='Completed'&&(p.verified!==true||p.handled!==true))throw new CmsError(422,'Confirm verification and handling before completing the request.');const row:any=await db().prepare("SELECT * FROM website_submissions WHERE id=? AND kind='privacy'").bind(String(p.id||'')).first();if(!row)throw new CmsError(404,'Request unavailable.');const data={...JSON.parse(row.payload),status:p.status,statusUpdatedAt:new Date().toISOString(),statusUpdatedBy:me.email};const updated:any=await db().prepare('UPDATE website_submissions SET payload=? WHERE id=? AND payload=?').bind(JSON.stringify(data),row.id,row.payload).run();if(updated.meta?.changes!==1)throw new CmsError(409,'This request changed. Refresh and try again.');await auditIntake(me.email,row.id,'privacy request status',p.status);return response({saved:true,record:publicRecord({...row,payload:JSON.stringify(data)})})}catch(e){return failure(e)}}
