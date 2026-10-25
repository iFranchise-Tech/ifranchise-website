import {db} from '../cms/auth';
// Record access metadata only; never copy form answers or resumes into the audit log.
export async function auditIntake(actor:string,recordId:string,action:string,note=''){
 await db().prepare('INSERT INTO cms_events (id,record_id,action,actor,note,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),'intake:'+recordId,action,actor,note,new Date().toISOString()).run();
}
