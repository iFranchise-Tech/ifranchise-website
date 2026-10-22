import {canView} from '../cms/policy.mjs';
export function canViewSubmission(member:any,kind:string){return canView(member,kind==='job'?'applications':'enquiries')}
export function publicRecord(row:any){const {session_id,resume_key,...record}=row;return {...record,payload:JSON.parse(row.payload),hasResume:!!resume_key}}
