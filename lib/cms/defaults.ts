import brands from '../../content/brands.json';
import research from '../../content/brand-research.json';
import careers from '../../content/careers.json';
import {editorialArticles} from '../editorial';
import {homeQuestions} from '../search-content';
export const pageDefaults=[
 {slug:'homepage',title:'Homepage',headline:'Franchise consulting',accent:'for business growth.',intro:'Explore a franchise opportunity or prepare your business for more locations. We help you assess the options, work through the details and plan what comes next.',overviewTitle:'How we support your plans',overviewIntro:'Whether you are choosing a business or developing a franchise network, our work begins with your priorities.'},
 {slug:'faqs',title:'Franchising FAQs',questions:homeQuestions},
];
export const defaults:Record<string,any[]>={
 franchises:brands.map(b=>({...b,overview:(research as any)[b.slug]?.overview||b.about,highlights:(research as any)[b.slug]?.highlights||[],sources:(research as any)[b.slug]?.sources||[]})),
 jobs:careers.jobs.map(j=>({...j,slug:j.id,aboutRole:j.aboutRole||j.about,requirements:j.requirements||j.keySkills||[],applyNote:j.applyNote||'Send your CV and the role title.',experience:j.experience||'',tagline:j.tagline||''})),articles:editorialArticles,pages:pageDefaults,
 placements:[{slug:'franchises',title:'Franchise display order',ids:[...brands].sort((a,b)=>a.name.localeCompare(b.name)).map(b=>b.slug)}],
};
export function baseline(kind:string,slug:string){const p=defaults[kind]?.find(x=>x.slug===slug);if(!p)return null;const active=kind!=='jobs'||p.active;return {id:kind+':'+slug,kind,slug,draft:p,live:active?p:null,status:active?'published':'archived',intent:'publish',version:0,updatedBy:'Website import',submittedBy:null,updatedAt:null};}
export function blank(kind:string){if(kind==='franchises')return {slug:'',name:'',category:'',investment:null,budget:'',model:'FOFO',description:'',overview:'',highlights:[],sources:[],logo:'',gallery:[],brochure:'',facts:{sqFt:'',locationType:'',franchiseFee:'',agreementTerm:'',lockInPeriod:''}};if(kind==='jobs')return {slug:'',id:'',title:'',dept:'',type:'Full-time',mode:'Onsite',location:'',experience:'',tagline:'',aboutRole:'',responsibilities:[],requirements:[],keySkills:[],whyJoin:'',applyEmail:'hr@ifranchise.in',applyNote:'Send your CV and the role title.',reportsTo:'',salary:'',active:true};return {slug:'',title:'',excerpt:'',category:'Fundamentals',audience:'all',image:'',imageAlt:'',introHighlight:'',sections:[{heading:'',body:[],bullets:[]}],faqs:[],sources:[],relatedSlugs:[],date:new Date().toISOString().slice(0,10)};}
