import {indianStates} from '../lib/locations.mjs';
export function LocationFields({id,preferred=false}:{id:string;preferred?:boolean}){
 return <div className="field-row"><div className="field"><label htmlFor={id+'-state'}>{preferred?'Preferred state / UT':'State / UT'} *</label><select id={id+'-state'} name="state" autoComplete={preferred?'off':'address-level1'} required defaultValue=""><option value="" disabled>Select state / UT</option>{indianStates.map(state=><option key={state}>{state}</option>)}</select></div><div className="field"><label htmlFor={id+'-city'}>{preferred?'Preferred city':'City'} *</label><input id={id+'-city'} name="city" type="text" required minLength={2} maxLength={120} autoComplete={preferred?'off':'address-level2'} placeholder="Enter city"/></div></div>;
}
