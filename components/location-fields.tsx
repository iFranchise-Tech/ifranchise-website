"use client";
import {useState} from 'react';
import {indianStates,validateManualCity} from '../lib/locations.mjs';
export function LocationFields({id,preferred=false}:{id:string;preferred?:boolean}){
 const [city,setCity]=useState(''),[error,setError]=useState('');
 function validate(input:HTMLInputElement){let message='';try{validateManualCity(input.value)}catch(e:any){message=e.message}input.setCustomValidity(message);setError(message)}
 return <div className="field-row"><div className="field"><label htmlFor={id+'-state'}>{preferred?'Preferred state / UT':'State / UT'} *</label><select id={id+'-state'} name="state" autoComplete={preferred?'off':'address-level1'} required defaultValue=""><option value="" disabled>Select state / UT</option>{indianStates.map(state=><option key={state}>{state}</option>)}</select></div><div className="field"><label htmlFor={id+'-city'}>{preferred?'Preferred city':'City'} *</label><input id={id+'-city'} name="city" type="text" required minLength={2} maxLength={120} autoComplete={preferred?'off':'address-level2'} placeholder="Enter city" value={city} aria-invalid={!!error} aria-describedby={error?id+'-city-error':undefined} onChange={e=>{const value=e.target.value.replace(/\p{N}/gu,'');setCity(value);e.target.value=value;try{validateManualCity(value);e.target.setCustomValidity('')}catch(error:any){e.target.setCustomValidity(error.message)}setError('')}} onBlur={e=>validate(e.currentTarget)} onInvalid={e=>validate(e.currentTarget)}/>{error&&<span id={id+'-city-error'} className="field-error" role="alert">{error}</span>}</div></div>;
}
