import {normalizeWorkEmail} from '../contact-validation.mjs';
export const SCOPES=['franchises','industries','jobs','blogs','articles','videos','faqs','pages'];
export const PERMISSION_SCOPES=[...SCOPES,'enquiries','applications'];
export const ROLES=['super_admin','approver','editor','viewer'];
export const scopeFor=kind=>kind==='placements'?'franchises':kind;
export function workEmail(email){try{normalizeWorkEmail(email);return true;}catch{return false;}}
export function permissionsFor(member){
 if(member?.permissions)return member.permissions;
 const legacy=[...(member?.scopes||[])];if(legacy.includes('pages'))legacy.push('faqs');const permissions={};for(const scope of legacy)permissions[scope]={view:true,edit:member.role!=='viewer',approve:member.role==='approver'};
 return permissions;
}
export function hasPermission(member,kind,action){return member?.status==='active'&&(member.role==='super_admin'||permissionsFor(member)[scopeFor(kind)]?.[action]===true);}
export const canView=(member,kind)=>hasPermission(member,kind,'view');
export const canEdit=(member,kind)=>canView(member,kind)&&hasPermission(member,kind,'edit');
export const canReview=(member,kind)=>canView(member,kind)&&hasPermission(member,kind,'approve');
export const canPublish=(member,kind)=>canEdit(member,kind)&&canReview(member,kind);
export function isInReportingChain(actor,submitter,members){const visited=new Set();let current=members.find(m=>m.email===submitter);while(current?.manager&&!visited.has(current.email)){visited.add(current.email);if(current.manager===actor)return true;current=members.find(m=>m.email===current.manager);}return false;}
export function canApprove(member,record,members){return canReview(member,record.kind)&&(member.role==='super_admin'||record.submittedBy===member.email||isInReportingChain(member.email,record.submittedBy,members));}
export function validateHierarchy(candidate,members){
 if(candidate.role==='super_admin')return candidate.manager?'Super Admin cannot have a reporting manager.':null;
 if(!candidate.manager)return 'Choose a reporting manager.';
 const manager=members.find(m=>m.email===candidate.manager&&m.status==='active');
 if(!manager)return 'Choose an active reporting manager.';
 if(manager.role!=='super_admin'&&candidate.scopes.some(s=>!canView(manager,s)||(SCOPES.includes(s)&&canEdit({...candidate,status:'active'},s)&&!canReview(manager,s))))return 'The reporting manager must have access to every assigned section and approval access for edited sections.';
 const visited=new Set([candidate.email]);let current=manager;while(current){if(visited.has(current.email))return 'Reporting relationships cannot contain a cycle.';visited.add(current.email);current=members.find(m=>m.email===current.manager);}return null;
}
export function assetUrl(value,required=false){if(!value)return !required;return typeof value==='string'&&value.length<1000&&(/^\/(?!\/)[\w./%+() -]+$/.test(value)||/^https:\/\//.test(value)&&(()=>{try{const u=new URL(value);return !u.username&&!u.password}catch{return false}})());}
