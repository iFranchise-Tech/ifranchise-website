export const SCOPES=['franchises','jobs','articles','pages'];
export const ROLES=['super_admin','approver','editor','viewer'];
export const scopeFor=kind=>kind==='placements'?'franchises':kind;
export function workEmail(email){return typeof email==='string'&&/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@ifranchise\.in$/i.test(email)&&email.length<=254;}
export function canView(member,kind){return member?.status==='active'&&(member.role==='super_admin'||member.scopes.includes(scopeFor(kind)));}
export function canEdit(member,kind){return canView(member,kind)&&member.role!=='viewer';}
export function isInReportingChain(actor,submitter,members){
 const visited=new Set();let current=members.find(m=>m.email===submitter);
 while(current?.manager&&!visited.has(current.email)){visited.add(current.email);if(current.manager===actor)return true;current=members.find(m=>m.email===current.manager);}return false;
}
export function canApprove(member,record,members){return canEdit(member,record.kind)&&(member.role==='super_admin'||member.role==='approver'&&record.submittedBy!==member.email&&isInReportingChain(member.email,record.submittedBy,members));}
export function validateHierarchy(candidate,members){
 if(candidate.role==='super_admin')return candidate.manager?'Super Admin cannot have a reporting manager.':null;
 if(!candidate.manager)return 'Choose a reporting manager.';
 const manager=members.find(m=>m.email===candidate.manager&&m.status==='active');
 if(!manager||!['super_admin','approver'].includes(manager.role))return 'Choose an active Super Admin or Approver as reporting manager.';
 if(manager.role!=='super_admin'&&!candidate.scopes.every(s=>manager.scopes.includes(s)))return 'The reporting manager must have access to every assigned section.';
 const visited=new Set([candidate.email]);let current=manager;
 while(current){if(visited.has(current.email))return 'Reporting relationships cannot contain a cycle.';visited.add(current.email);current=members.find(m=>m.email===current.manager);}return null;
}
export function assetUrl(value,required=false){if(!value)return !required;return typeof value==='string'&&value.length<1000&&(/^\/(?!\/)[\w./%+() -]+$/.test(value)||/^https:\/\//.test(value)&&(()=>{try{const u=new URL(value);return !u.username&&!u.password}catch{return false}})());}
