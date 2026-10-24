import locations from './data/india-locations.json' with {type:'json'};
import {validateState} from './locations.mjs';
const key=value=>String(value||'').normalize('NFKC').trim().toLocaleLowerCase('en-IN');
export function citiesForState(value){
 const state=validateState(value);
 return locations.states.find(s=>s.name===state)?.cities.map(({name,aliases})=>({name,aliases}))||[];
}
export function validateCity(value,state){
 const city=citiesForState(state).find(c=>[c.name,...c.aliases].some(name=>key(name)===key(value)));
 if(!city)throw Error('Select a city from the list for your chosen state or union territory.');
 return city.name;
}
