import {completeFaqs} from '../faq-content.mjs';
export const franchiseModels=['FOFO','FOCO','FICO','COCO','Unit Franchise','Master Franchise','Area Development'];
export function brandModels(brand){return brand.models?.length?brand.models:String(brand.model||'').replace(/Foco Model/ig,'FOCO').split(/,\s*/).filter(Boolean);}
export function brandQuestions(b){return completeFaqs(b.faqs||[],[
 {q:'What is the proposed investment for '+b.name+'?',a:'The listed investment is '+b.budget+'. Request a current cost sheet for your chosen format and location, including fees, setup, stock, taxes and working capital.'},
 {q:'Which operating models does '+b.name+' offer?',a:'The listed operating model is '+brandModels(b).join(' / ')+'. Confirm the responsibilities for staffing, daily operations, working capital and reporting in the current proposal.'},
 {q:'What space does '+b.name+' require?',a:b.facts?.sqFt&&b.facts.sqFt!=='--'?'The listed space requirement is '+b.facts.sqFt+'. The brand must approve the location and layout before you commit to a property.':'Ask for the current property and space requirements for your preferred '+b.name+' format before choosing a site.'},
 {q:'Can I open '+b.name+' in my preferred location?',a:'Territory availability depends on '+b.name+'’s expansion plans and existing network. Share your city and proposed location to discuss availability and the next steps.'},
 {q:'How do I request the current details for '+b.name+'?',a:'Complete the enquiry form with your contact details, preferred location, investment range and intended start time. The team can then discuss the current format and proposal with you.'}
]);}
export function hydrateBrand(b){const {sources,...clean}=b;return {...clean,models:brandModels(b),model:brandModels(b).join(', '),brochureEnabled:false,faqs:brandQuestions(b)};}

// These imported entries describe revenue, not the return to a franchise partner.
const nonReturnEntries=new Set(['Multi-channel revenue model','ARR ₹32 Cr (2025)']);
export function brandReturns(brand){
 const value=typeof brand.facts?.returns==='string'?brand.facts.returns.trim():'';
 return value&&!['--','-'].includes(value)&&!nonReturnEntries.has(value)?value:'Available on request';
}
