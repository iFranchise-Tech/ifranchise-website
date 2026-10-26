// Preserve editorial answers first; fill only missing display slots. Stored drafts stay intact.
export function completeFaqs(items = [], supplements = []) {
 const seen = new Set();
 return [...items, ...supplements].map(f => ({q: f.q ?? f.question, a: f.a ?? f.answer})).filter(f => {
  if (!f.q?.trim() || !f.a?.trim()) return false;
  const key = f.q.trim().toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key); return true;
 }).slice(0, 5);
}
const general = [
 {q:'How do I start a conversation with iFranchise?',a:'Use the enquiry form to share your contact details, preferred location and plans. Choose whether you want to explore a franchise or expand your business so the team can respond to the right enquiry.'},
 {q:'What should I prepare before discussing an opportunity?',a:'Keep your preferred city, available investment and intended involvement in mind. If you already have a location or a shortlist of brands, include those details in your enquiry.'},
 {q:'Are the investment figures and returns final?',a:'Treat published figures as indicative. Confirm the costs, operating responsibilities and return terms in the brand’s current written proposal before making a commitment.'},
 {q:'Can I enquire about my preferred city?',a:'Yes. Select your state or union territory and enter your city in the enquiry form. Availability depends on the brand’s current expansion plans and existing locations.'},
 {q:'Where can I learn about franchise operating models?',a:'The operating-model guide explains the different formats. For a specific opportunity, ask the brand to confirm who invests, who operates the outlet and how each party is paid.'},
];
const brandListing = [
 {q:'What information should my brand listing include?',a:'Share your business profile, operating model, indicative investment, space requirements, brand logo and outlet photographs. Include the support you can provide to franchise partners.'},
 {q:'Can I discuss expansion before my franchise model is ready?',a:'Yes. Explain your current business and expansion goals. The discussion can cover readiness, commercial structure, operating responsibilities, training and partner support.'},
 {q:'How do I submit my brand for a discussion?',a:'Complete the brand enquiry form with your contact and business details. Use the message field to explain your expansion plans and the locations you want to explore.'},
 {q:'Do I need to have an outlet location ready?',a:'Share the locations you currently operate and your preferred expansion areas. Property and territory requirements can then be considered alongside your proposed franchise format.'},
 {q:'Does listing my brand guarantee franchise enquiries or sales?',a:'A listing does not guarantee enquiries, franchise sales or investment returns. Partner suitability and commercial terms must be evaluated separately for each opportunity.'},
];
export function pageFaqs(slug, items = []) {
 const additions = slug === 'list-your-brand' ? [...brandListing.slice(2), ...brandListing.slice(0,2)] : slug === 'opportunities' ? [general[1], general[3], general[4], general[0], general[2]] : general;
 return completeFaqs(items, additions);
}
export function resourceFaqs(article) {
 if (!article.faqs?.length) return [];
 const supplements = (article.sections || []).flatMap(section => {
  const heading = String(section.heading || '').trim();
  if (!heading || /example|hypothetical|illustrat|case study/i.test(heading)) return [];
  const body = Array.isArray(section.body) ? section.body : [section.body];
  const paragraphs = body.filter(p => typeof p === 'string' && p.trim() && !/hypothetical|illustrative/i.test(p));
  // Use complete source sentences, never cut a financial qualification mid-sentence.
  const sentences = paragraphs.flatMap(p => p.match(/[^.!?]+(?:[.!?](?=\s|$)|$)/g) || []);
  let answer = '';
  for (const sentence of sentences) {
   const next = (answer + ' ' + sentence.trim()).trim();
   if (next.length > 400) break;
   answer = next;
  }
  const question = heading.endsWith('?') ? heading : `What should I know about “${heading.replace(/[.:]$/, '')}”?`;
  return answer && question.length <= 100 ? [{q:question,a:answer}] : [];
 });
 return completeFaqs(article.faqs, [...supplements, ...general]);
}
