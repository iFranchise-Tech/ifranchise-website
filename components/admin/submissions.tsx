'use client';
import {LoadingState} from './loading-state';
import {EmptyState} from './empty-state';
import {TableViewport} from './table-viewport';
import {Pagination} from './pagination';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Download} from 'lucide-react';
import {cmsRequest} from '../../lib/cms/client.mjs';
import {PrivacyWorkflow} from './privacy-workflow';
import {canEdit,canView} from '../../lib/cms/policy.mjs';
const names:Record<string,string>={investor:'Franchise enquiry',brand:'Brand expansion',general:'General enquiry',job:'Job application',privacy:'Privacy request'};
const labels:Record<string,string>={name:'Name',email:'Email',phone:'Phone',city:'City',state:'State / UT',brandName:'Brand',budget:'Investment range',timeframe:'Timeframe',companyName:'Business name',companyWebsite:'Business website',message:'Message',jobTitle:'Role',experience:'Experience',requestType:'Privacy request',reference:'Related reference',status:'Request status',consentVersion:'Notice version',consentPurpose:'Consent purpose',consentAt:'Consent recorded',qualification:'Highest qualification',course:'Course / field of study',educationStatus:'Qualification status',institution:'Institution',employmentStatus:'Employment status',noticePeriod:'Notice period',profile:'Profile / portfolio',coverNote:'Cover note',sourcePage:'Source page'};
type SubmissionRecord={id:string;kind:string;sheet_status:string;created_at:string;payload:Record<string,unknown>;hasResume?:boolean;reference:string};
export function SubmissionDetails({record,onUpdate}:{record:SubmissionRecord;onUpdate:(record:SubmissionRecord)=>void}){const r=record;return <section className="cms-panel"><div className="cms-row"><h2>{names[r.kind]}</h2><span className={'cms-status '+(r.sheet_status==='synced'?'published':'draft')}>{r.kind==='privacy'?'Private request':r.sheet_status==='synced'?'In Google Sheet':'Awaiting sync'}</span></div><p className="cms-muted">{new Date(r.created_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST</p><dl className="submission-details">{Object.entries(labels).filter(([k])=>r.payload[k]).map(([k,label])=><div key={k}><dt>{label}</dt><dd>{String(r.payload[k])}</dd></div>)}</dl>{r.hasResume&&<a className="cms-button cms-primary" href={'/api/admin/intake/resume/'+r.id}><Download size={17}/>Download resume</a>}<p className="cms-muted submission-reference">{r.reference}</p>{r.kind==='privacy'&&<PrivacyWorkflow key={r.id} record={r} onSaved={onUpdate}/>}</section>}
export function Submissions({me,description,recordId,search,onQuery,onOpen,onClose}:{me:any;description:string;recordId:string;search:string;onQuery:(values:Record<string,string|number|null>,push?:boolean)=>void;onOpen:(id:string)=>void;onClose:()=>void}){
 const [data,setData]=useState<any>(null),[loadedQuery,setLoadedQuery]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(true),[selected,setSelected]=useState<any>(null),[syncNotice,setSyncNotice]=useState('');
 const url=new URLSearchParams(search),number=Number(url.get('page')),page=Number.isSafeInteger(number)&&number>0?number:1,filters={type:url.get('type')||'',received:url.get('received')||'',sync:url.get('sync')||''};
 const setPage=(page:number)=>onQuery({page},true);
 const params=new URLSearchParams({page:String(page)});for(const [key,value] of Object.entries(filters))if(value)params.set(key,value);
 const query=params.toString(),filtered=Object.values(filters).some(Boolean),selectedId=recordId;
 const refresh=useRef<()=>Promise<void>>(async()=>{}),syncActive=useRef(false),accessDenied=useRef(false);
 const canSync=canEdit(me,'enquiries')||canEdit(me,'applications');
 function changeFilter(key:keyof typeof filters,value:string){onQuery({[key]:value,page:1})}

 // One request loop for the current list or detail. Filters cancel old reads;
 // background updates leave the existing table and privacy form mounted.
 useEffect(()=>{
  let active=true,inFlight=false,refreshQueued=false,lastStarted=0,timer:ReturnType<typeof setTimeout>|undefined,controller:AbortController|undefined;
  async function load(){
   if(!active||inFlight||accessDenied.current||document.visibilityState==='hidden'||!navigator.onLine)return;
   clearTimeout(timer);inFlight=true;lastStarted=Date.now();controller=new AbortController();setBusy(true);
   try{
    const result=await cmsRequest('/api/admin/intake?'+(selectedId?'id='+encodeURIComponent(selectedId):query),{signal:controller.signal});
    if(!active)return;
    setError('');
    if(selectedId)setSelected(result.record);
    else{
     // A filter's last page can disappear when pending rows finish syncing.
     const lastPage=Math.max(1,Math.ceil(result.total/25));
     if(page>lastPage){onQuery({page:lastPage});return}
     setData(result);setLoadedQuery(query);
    }
   }catch(e:any){if(active&&e.name!=='AbortError'){if(e.status===401||e.status===403){accessDenied.current=true;setData(null);setLoadedQuery('');setSelected(null);setSyncNotice('')}else if(e.status===404&&selectedId)setSelected(null);setError(e.message||'Unable to update the Inbox. Check your connection.')}}
   finally{inFlight=false;if(active){setBusy(false);if(refreshQueued){refreshQueued=false;void load()}else if(!accessDenied.current)timer=setTimeout(()=>{void load()},30000)}}
  }
  const resume=()=>{if(document.visibilityState!=='hidden'&&Date.now()-lastStarted>=15000)void load()};
  refresh.current=async()=>{if(inFlight){refreshQueued=true;return}await load()};void load();
  document.addEventListener('visibilitychange',resume);window.addEventListener('focus',resume);window.addEventListener('online',resume);
  return()=>{active=false;clearTimeout(timer);controller?.abort();document.removeEventListener('visibilitychange',resume);window.removeEventListener('focus',resume);window.removeEventListener('online',resume)};
 },[query,selectedId,me.email,onQuery,page]);

 // Reuse the existing permission-checked sync endpoint; never sync on filter
 // changes. A lock also avoids simultaneous retries from multiple CMS tabs.
 useEffect(()=>{
  if(!canSync)return;
  let active=true,timer:ReturnType<typeof setTimeout>|undefined;
  async function sync(){
   if(!active)return;
   if(document.visibilityState==='hidden'||!navigator.onLine||syncActive.current||accessDenied.current){timer=setTimeout(()=>{void sync()},60000);return}
   syncActive.current=true;
   try{
    const run=async()=>{
     const result=await cmsRequest('/api/admin/intake',{method:'POST'});
     if(active&&!accessDenied.current){setSyncNotice(result.pending?'Some submissions are awaiting sync. They will retry automatically.':'');if(result.synced>0)await refresh.current()}
    };
    if(navigator.locks)await navigator.locks.request('ifranchise-inbox-sync',{ifAvailable:true},async lock=>{if(lock)await run()});else await run();
   }catch(e:any){if(active&&!accessDenied.current){if(e.status===401||e.status===403){accessDenied.current=true;setData(null);setLoadedQuery('');setSelected(null);setSyncNotice('');setError(e.message)}else setSyncNotice('Automatic sync is temporarily unavailable. '+e.message+' It will retry automatically.')}}
   finally{syncActive.current=false;if(active)timer=setTimeout(()=>{void sync()},60000)}
  }
  timer=setTimeout(()=>{void sync()},5000);
  return()=>{active=false;clearTimeout(timer)};
 },[canSync,me.email]);
 return <>
  <div className="cms-page-heading cms-inbox-heading"><div><h1>Inbox</h1><p className="cms-section-description">{description}</p></div>{!recordId&&<div className="cms-inbox-filters">
   <label>Submission type<select value={filters.type} onChange={e=>changeFilter('type',e.target.value)}><option value="">All types</option>{Object.entries(names).filter(([kind])=>kind==='privacy'?me.role==='super_admin':canView(me,kind==='job'?'applications':'enquiries')).map(([kind,label])=><option key={kind} value={kind}>{label}</option>)}</select></label>
   <label>Received date <span className="cms-inbox-zone">(IST)</span><input type="date" value={filters.received} onChange={e=>changeFilter('received',e.target.value)}/></label>
   <label>Sync status<select value={filters.sync} onChange={e=>changeFilter('sync',e.target.value)}><option value="">All statuses</option><option value="pending">Pending</option><option value="synced">Synced</option>{me.role==='super_admin'&&<option value="private">Private</option>}</select></label>
  </div>}</div>
  {error&&<div className="cms-error" role="alert">{error}{(data||selected)&&' Displayed information may be out of date; updates will retry automatically.'}<button className="cms-button" disabled={busy} onClick={()=>{accessDenied.current=false;void refresh.current()}}>Retry</button></div>}
  {syncNotice&&<p className="cms-inbox-sync-notice" role="status">{syncNotice}</p>}
  {recordId?(selected?.id===recordId?<div className="cms-page-scroll" tabIndex={0} aria-label="Submission details"><button className="cms-link" onClick={onClose}>← All submissions</button><SubmissionDetails record={selected} onUpdate={next=>{setSelected(next);setData((current:any)=>current?({...current,records:current.records.map((r:any)=>r.id===next.id?next:r)}):current)}}/></div>:!error&&<LoadingState label="Loading submission"/>):loadedQuery!==query?(!error&&<LoadingState label="Loading submissions"/>):<section className="cms-panel cms-scroll-panel cms-inbox-panel" aria-busy={busy}>
   <TableViewport className="cms-inbox-table-wrap" label="Inbox submissions" key={query} emptyState={data&&!data.records.length&&<EmptyState heading="h2" title={filtered?'No matching submissions':'No submissions yet'} description={filtered?'Try another type, date or sync status.':'Enquiries and applications available to your role will appear here.'}/>}><table className="cms-table cms-inbox-table"><caption className="cms-sr">Inbox submissions</caption><colgroup><col/><col className="cms-inbox-col-type"/><col className="cms-inbox-col-date"/><col className="cms-inbox-col-sync"/><col className="cms-inbox-col-action"/></colgroup><thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Received</th><th scope="col">Sheet</th><th scope="col">Action</th></tr></thead><tbody>{data?.records.map((r:any)=><tr key={r.id}><td><strong>{r.payload.name||'Privacy request'}</strong><small>{r.payload.email}</small></td><td><span className="cms-inbox-type-name">{names[r.kind]}</span>{(r.payload.brandName||r.payload.companyName||r.payload.jobTitle)&&<><span className="cms-inbox-type-divider" aria-hidden="true"> · </span><span className="cms-inbox-type-detail">{r.payload.brandName||r.payload.companyName||r.payload.jobTitle}</span></>}</td><td>{new Date(r.created_at).toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata'})}</td><td>{r.kind==='privacy'?'Private':r.sheet_status==='synced'?'Synced':'Pending'}</td><td><button className="cms-button" onClick={()=>onOpen(r.id)}>View <ArrowUpRight size={16}/></button></td></tr>)}</tbody></table>
   </TableViewport><Pagination count={`${data?.total||0} ${filtered?'matching submissions':'submissions'}`} page={page} totalPages={Math.max(1,Math.ceil((data?.total||0)/25))} disabled={busy||!data} onPage={setPage}/>
  </section>}
 </>;
}
