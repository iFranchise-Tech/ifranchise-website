'use client';
import {useNotification} from './notifications';
import {LoadingState} from './loading-state';
import {EmptyState} from './empty-state';
import {TableViewport} from './table-viewport';
import {useCallback,useEffect,useRef,useState} from 'react';
import {cmsRequest} from '../../lib/cms/client.mjs';
import {processEmailQueue} from '../../lib/cms/email-delivery.mjs';
import {deliveryDisplay} from '../../lib/cms/delivery-display.mjs';
type Delivery={id:string;kind:string;status:string;provider_id:string|null;attempts:number;last_error:string|null;created_at:number;updated_at:number};
export function EmailDelivery(){
 const [rows,setRows]=useState<Delivery[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[loaded,setLoaded]=useState(false);
 const requestId=useRef(0),processing=useRef(false),notify=useNotification();
 const load=useCallback(async()=>{const id=++requestId.current;setLoading(true);setError('');notify('');try{const d=await cmsRequest('/api/admin/email');if(id===requestId.current){setRows(d.emails);setLoaded(true)}}catch(e){if(id===requestId.current)setError(e instanceof Error?e.message:'Unable to load delivery history.')}finally{if(id===requestId.current)setLoading(false)}},[notify]);
 useEffect(()=>{void load();return()=>{requestId.current++}},[load]);
 async function retry(id?:string){if(processing.current)return;processing.current=true;const operation=++requestId.current;setBusy(true);setError('');notify('');try{const result=await processEmailQueue(id);if(operation!==requestId.current)return;if(result.emails!==null){setRows(result.emails);setLoaded(true)}setError(result.error);if(result.notice)notify(result.notice,result.error?'error':'info')}catch(e){if(operation===requestId.current)setError(e instanceof Error?e.message:'Unable to process email.')}finally{processing.current=false;if(operation===requestId.current)setBusy(false)}}
 return <section className="cms-panel cms-scroll-panel cms-email-panel" aria-busy={loading||busy}>
  <div className="cms-toolbar"><details className="cms-delivery-help"><summary>About delivery statuses</summary><p>Accepted means Resend received the request. Delivered means the recipient’s mail server accepted the email. Captured emails were saved locally and were not sent.</p></details><div className="cms-actions"><button className="cms-button" disabled={loading||busy} onClick={()=>{void load()}}>Refresh</button><button className="cms-button" disabled={busy||loading} onClick={()=>{void retry()}}>{busy?'Processing…':'Process pending emails'}</button></div></div>
  {error&&<div className="cms-error" role="alert">{error}<button className="cms-button" disabled={loading||busy} onClick={()=>{void load()}}>Retry</button></div>}
  <TableViewport label="Email delivery history" emptyState={!loading&&!error&&loaded&&!rows.length&&<EmptyState title="No transactional emails yet" description="Invitation, enquiry and notification activity will appear here."/>}>
  {loading&&!loaded?<LoadingState label="Loading delivery history"/>:!error&&loaded&&(rows.length?<table className="cms-table cms-email-table"><colgroup><col/><col/><col className="cms-email-attempts"/><col/><col/></colgroup><thead><tr><th scope="col">Type</th><th scope="col">Status</th><th scope="col">Attempts</th><th scope="col">Updated</th><th scope="col">Delivery reference</th></tr></thead><tbody>{rows.map(row=>{const display=deliveryDisplay(row);return <tr key={row.id}><td>{display.type}</td><td><span className="cms-status">{display.status}</span>{display.error&&<small>{display.error}</small>}{!row.provider_id&&['failed','blocked'].includes(row.status)&&<button className="cms-button" disabled={busy||loading} onClick={()=>{void retry(row.id)}}>Retry delivery</button>}</td><td>{row.attempts}</td><td>{new Date(row.updated_at).toLocaleString()}</td><td><details className="cms-delivery-reference"><summary>View reference</summary><small>{row.provider_id?'Provider reference':'Queue reference'}</small><code>{row.provider_id||row.id}</code></details></td></tr>})}</tbody></table>:null)}
  </TableViewport>
 </section>;
}
