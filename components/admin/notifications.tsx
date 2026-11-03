'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {Check,AlertCircle,X} from 'lucide-react';
type Notice={id:number;message:string;kind:'success'|'error'|'info'};
type Notify=(message:string,kind?:Notice['kind'])=>void;
const Notifications=createContext<Notify>(()=>{});
export const useNotification=()=>useContext(Notifications);
function Toast({notice,dismiss}:{notice:Notice;dismiss:()=>void}){
 const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const stop=useCallback(()=>{clearTimeout(timer.current)},[]);
 const start=useCallback(()=>{stop();if(notice.kind!=='error')timer.current=setTimeout(dismiss,6000)},[dismiss,notice.kind,stop]);
 useEffect(()=>{start();return stop},[start,stop]);
 return <div className={'cms-toast cms-toast-'+notice.kind} role={notice.kind==='error'?'alert':'status'} onMouseEnter={stop} onMouseLeave={start} onFocus={stop} onBlur={start}>
  {notice.kind==='success'?<Check size={18} aria-hidden="true"/>:<AlertCircle size={18} aria-hidden="true"/>}<span>{notice.message}</span><button type="button" aria-label="Dismiss notification" onClick={dismiss}><X size={16}/></button>
 </div>;
}
export function NotificationProvider({children}:{children:React.ReactNode}){
 const [notice,setNotice]=useState<Notice|null>(null),sequence=useRef(0);
 const notify=useCallback<Notify>((message,kind='success')=>setNotice(message?{id:++sequence.current,message,kind}:null),[]);
 const dismiss=useCallback(()=>setNotice(null),[]);
 return <Notifications.Provider value={notify}>{children}{notice&&<Toast key={notice.id} notice={notice} dismiss={dismiss}/>}</Notifications.Provider>;
}
