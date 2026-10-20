import {checkMedia} from '../../../lib/cms/media-permissions';
import {adminIdentity,assertOrigin,boundedBody,CmsError,db,failure,getMembers,memberFromRow,response} from '../../../lib/cms/auth';
import {canView,canEdit,canApprove,scopeFor,SCOPES,ROLES,validateHierarchy,workEmail} from '../../../lib/cms/policy.mjs';
import {getRecord,allRecords,summary,writeRecord} from '../../../lib/cms/store';
import {validPayload} from '../../../lib/cms/validation';
import {blank} from '../../../lib/cms/defaults';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{
 const me=await adminIdentity(),u=new URL(req.url),kind=u.searchParams.get('kind'),id=u.searchParams.get('id'),view=u.searchParams.get('view');
 if(id){const r=await getRecord(id);if(!r||!canView(me,r.kind))throw new CmsError(404,'Item not found.');const history=await db().prepare('SELECT id,action,actor,note,created_at FROM cms_events WHERE record_id=? ORDER BY created_at DESC LIMIT 50').bind(id).all();return response({record:r,history:history.results,canApprove:canApprove(me,r,await getMembers())});}
 if(kind){if(![...SCOPES,'placements'].includes(kind)||!canView(me,kind))throw new CmsError(403,'You do not have access to this section.');return response({records:(await allRecords(kind)).map(summary),blank:blank(kind)});}
 if(view==='team'){if(me.role!=='super_admin')throw new CmsError(403,'You do not have access to team settings.');return response({members:await getMembers()});}
 if(view==='media'){const media=(await db().prepare('SELECT * FROM cms_media ORDER BY created_at DESC LIMIT 200').all()).results.filter((m:any)=>canView(me,m.scope));return response({media});}
 const sections=[...SCOPES,'placements'].filter(k=>canView(me,k));const rows=(await Promise.all(sections.map(allRecords))).flat();
 const pending=rows.filter(r=>r.status==='review');const team=await getMembers();
 const activity=(await db().prepare('SELECT id,record_id,action,actor,note,created_at FROM cms_events ORDER BY created_at DESC LIMIT 150').all()).results.filter((e:any)=>e.record_id.startsWith('team:')?me.role==='super_admin':canView(me,e.record_id.split(':')[0])).slice(0,30);
 return response({me,counts:Object.fromEntries(SCOPES.filter(k=>canView(me,k)).map(k=>[k,rows.filter(r=>r.kind===k&&r.status!=='archived').length])),pending:pending.map(r=>({...summary(r),canApprove:canApprove(me,r,team)})),recent:rows.filter(r=>r.version>0).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||'')).slice(0,6).map(summary),activity});
 }catch(e){return failure(e)}}
export async function POST(req:Request){try{
 assertOrigin(req);const me=await adminIdentity();if(!req.headers.get('content-type')?.includes('application/json'))throw new CmsError(415,'Use JSON for this request.');const text=new TextDecoder().decode(await boundedBody(req,350000));let body:any;try{body=JSON.parse(text)}catch{throw new CmsError(400,'Invalid request.')}
 const {action}=body;
 if(action==='member')return await changeMember(me,body);
 const kind=body.kind;if(![...SCOPES,'placements'].includes(kind)||!canEdit(me,kind))throw new CmsError(403,'You cannot edit this section.');
 if(!Number.isInteger(body.version)||body.version<0)throw new CmsError(400,'Missing item version.');
 if(typeof body.slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug))throw new CmsError(422,'Invalid URL slug.');
 const id=kind+':'+body.slug;let r:any=await getRecord(id);
 if(r&&r.version!==body.version||!r&&body.version!==0)throw new CmsError(409,'Someone changed this item. Reload it before saving.');
 const note=typeof body.note==='string'?body.note.trim().slice(0,2000):'';
 if(action==='save'){
  if(r?.status==='review')throw new CmsError(409,'Withdraw this submission before editing it.');
  if(kind==='pages'&&!r||kind==='placements'&&body.slug!=='franchises')throw new CmsError(422,'This page cannot be created.');
  const draft=validPayload(kind,body.payload);await checkMedia(me,draft);if(draft.slug!==body.slug)throw new CmsError(422,'The URL slug cannot change after creation.');
  r={...(r||{id,kind,slug:body.slug,live:null}),draft,status:'draft',intent:'publish',submittedBy:null};
 }else{
  if(!r)throw new CmsError(404,'Item not found.');
  if(action==='submit'){
   if(!['draft','changes'].includes(r.status))throw new CmsError(409,'Save a draft before submitting it.');
   if(r.intent!=='archive')r.draft=validPayload(kind,r.draft,true);
   if(kind==='placements'){const brands=await allRecords('franchises');if(r.draft.ids.some((s:string)=>!brands.some(b=>b.slug===s)))throw new CmsError(422,'The order contains an unknown brand.');}
   if(me.role!=='super_admin'){const team=await getMembers();if(!team.some(m=>canApprove(m,{...r,submittedBy:me.email},team)))throw new CmsError(422,'No approver is assigned for this section. Contact your Super Admin.');}
   r={...r,status:'review',submittedBy:me.email};
  }else if(action==='publish'||action==='reject'){
   if(r.status!=='review')throw new CmsError(409,'This item is not awaiting review.');
   if(!canApprove(me,r,await getMembers()))throw new CmsError(403,'This approval is assigned to a reporting manager.');
   if(action==='reject'){if(!note)throw new CmsError(422,'Add a review note.');r={...r,status:'changes'};}
   else {if(r.intent!=='archive')r.draft=validPayload(kind,r.draft,true);r={...r,live:r.intent==='archive'?null:r.draft,status:r.intent==='archive'?'archived':'published'};}
  }else if(action==='withdraw'){
   if(r.status!=='review'||me.email!==r.submittedBy&&me.role!=='super_admin')throw new CmsError(403,'Only the submitter or Super Admin can withdraw this submission.');r={...r,status:'draft',submittedBy:null};
  }else if(action==='archive'){
   if(['pages','placements'].includes(kind))throw new CmsError(422,'This section cannot be archived.');if(r.status==='review')throw new CmsError(409,'Withdraw this submission first.');r={...r,status:'draft',intent:'archive',submittedBy:null};
  }else if(action==='restore'){
   if(r.status!=='archived')throw new CmsError(409,'Only archived items can be restored.');r={...r,status:'draft',intent:'publish',submittedBy:null};
  }else if(action==='revert'){
   if(r.status==='review')throw new CmsError(409,'Withdraw this submission first.');const rev:any=await db().prepare('SELECT snapshot FROM cms_events WHERE id=? AND record_id=?').bind(body.revision,id).first();if(!rev?.snapshot)throw new CmsError(404,'Revision not found.');const snapshot=validPayload(kind,JSON.parse(rev.snapshot));await checkMedia(me,snapshot);r={...r,draft:snapshot,status:'draft',intent:'publish',submittedBy:null};
  }else throw new CmsError(400,'Unknown action.');
 }
 return response({record:await writeRecord(r,body.version,me.email,action,note)});
 }catch(e){return failure(e)}}
async function changeMember(me:any,b:any){
 if(me.role!=='super_admin')throw new CmsError(403,'Only a Super Admin can manage employees.');
 const p=b.payload,email=p?.email?.trim().toLowerCase();if(!workEmail(email))throw new CmsError(422,'Enter a valid iFranchise email address.');
 if(!p.name?.trim()||p.name.length>120||!ROLES.includes(p.role)||!Array.isArray(p.scopes)||p.scopes.some((s:string)=>!SCOPES.includes(s)))throw new CmsError(422,'Complete the employee details.');
 const members=await getMembers(),old=members.find(m=>m.email===email);if(old&&b.version!==old.version||!old&&b.version!==0)throw new CmsError(409,'This employee changed. Reload the team list.');
 if(!['invited','active','suspended'].includes(p.status))throw new CmsError(422,'Invalid status.');
 if(!old&&p.status!=='invited'||old&&!old.userId&&p.status==='active')throw new CmsError(422,'The employee must accept their invitation by signing in.');
 if(email===me.email&&(p.role!=='super_admin'||p.status!=='active'))throw new CmsError(422,'You cannot remove your own Super Admin access.');
 const candidate={...p,email,name:p.name.trim(),scopes:p.role==='super_admin'?[]:[...new Set(p.scopes)],manager:p.role==='super_admin'?null:p.manager||null};
 if(p.role!=='super_admin'&&!p.scopes.length)throw new CmsError(422,'Assign at least one section.');
 const proposed=[...members.filter(m=>m.email!==email),candidate];
 for(const member of proposed.filter(m=>m.status!=='suspended')){const problem=validateHierarchy(member,proposed);if(problem)throw new CmsError(422,member.name+': '+problem);}
 const teamVersion=members.reduce((n,m)=>n+m.version,0),teamSize=members.length;
 const now=new Date().toISOString(),expiry=p.status==='invited'?new Date(Date.now()+14*864e5).toISOString():null,id=crypto.randomUUID();
 const result=await db().batch([
 db().prepare(`INSERT INTO cms_members (email,user_id,name,role,scopes,manager,status,expires_at,version,created_at,updated_at) SELECT ?,NULL,?,?,?,?,?,?,1,?,? WHERE (SELECT COALESCE(SUM(version),0) FROM cms_members)=? AND (SELECT COUNT(*) FROM cms_members)=? ON CONFLICT(email) DO UPDATE SET name=excluded.name,role=excluded.role,scopes=excluded.scopes,manager=excluded.manager,status=excluded.status,expires_at=excluded.expires_at,version=cms_members.version+1,updated_at=excluded.updated_at WHERE cms_members.version=?`).bind(email,candidate.name,p.role,JSON.stringify(candidate.scopes),candidate.manager,p.status,expiry,now,now,teamVersion,teamSize,b.version),
 db().prepare('INSERT INTO cms_events(id,record_id,action,actor,snapshot,note,created_at) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM cms_members WHERE email=? AND version=? AND updated_at=?)').bind(id,'team:'+email,old?'update employee':'invite employee',me.email,null,candidate.role+' · '+candidate.status,now,email,b.version+1,now)
 ]);if(!result[0].meta.changes)throw new CmsError(409,'This employee changed. Reload before saving.');
 return response({members:await getMembers(),invited:!old||p.status==='invited'});
}
