/** Shared, dependency-free transactional email renderer. All dynamic copy is escaped. */
import {safeReturnPath} from '../intake/confirmation.mjs';
export const CMS_FROM = 'iFranchise <it@ifranchise.in>';
export const WEBSITE_FROM = 'iFranchise <contact@ifranchise.in>';
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const BRAND = {purple:'#32159b', ink:'#252033', muted:'#655f73', line:'#e8e4ef', background:'#f5f4f8', website:'https://www.ifranchise.in'};
const PUBLIC_WEBSITE_ORIGIN = 'https://ifranchise.in';
const FONT = 'Arial, Helvetica, sans-serif';

// Defense in depth for links, including the Outlook VML button. The service also
// validates EMAIL_PUBLIC_ORIGIN before any message is constructed.
function safeUrl(value) {
  const url = new URL(value);
  if (url.username || url.password || !(['https:'].includes(url.protocol) ||
      url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
    throw new Error('Unsafe email URL');
  }
  return value;
}
const paragraph = text => `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:26px;color:${BRAND.muted}">${escapeHtml(text)}</p>`;
function detailHtml(value){const text=value||'Not provided';return /^https:\/\/(?:www\.)?(?:drive|docs)\.google\.com\/\S+$/.test(text)?`<a href="${escapeHtml(text)}" style="color:${BRAND.purple};text-decoration:underline">${escapeHtml(text)}</a>`:escapeHtml(text);}
const detailTable = (details, inline=false) => !details.length ? '' : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf9fc" style="width:100%;table-layout:fixed;border:1px solid ${BRAND.line};border-radius:8px;margin-top:8px">${details.map(([label, value], i) => `<tr><td style="padding:${inline?'12px 16px':'16px 20px'};${i ? `border-top:1px solid ${BRAND.line};` : ''}font-family:${FONT}">${inline
  ? `<p style="margin:0;font-size:15px;line-height:24px;color:${BRAND.ink};overflow-wrap:anywhere;word-break:break-word"><span style="font-size:12px;font-weight:bold;letter-spacing:0.4px;white-space:nowrap;text-transform:uppercase;color:${BRAND.muted}">${escapeHtml(label)}&nbsp;:&nbsp;</span>${detailHtml(value)}</p>`
  : `<p style="margin:0 0 5px;font-size:11px;line-height:16px;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted}">${escapeHtml(label)}</p><p style="margin:0;font-size:15px;line-height:23px;color:${BRAND.ink};overflow-wrap:anywhere;word-break:break-word">${detailHtml(value)}</p>`
}</td></tr>`).join('')}</table>`;

function primaryAction({label, url}) {
  const href = escapeHtml(safeUrl(url));
  // Width/align attributes and a VML button give classic Outlook a fixed, centered
  // fallback. The ordinary link works without media queries or external CSS.
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:28px 0 24px;text-align:center">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:48px;v-text-anchor:middle;width:224px" arcsize="12%" stroke="f" fillcolor="${BRAND.purple}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold">${escapeHtml(label)}</center></v:roundrect><![endif]-->
<!--[if !mso]><!--><a class="email-cta" href="${href}" style="display:inline-block;width:224px;max-width:100%;background-color:${BRAND.purple};border-radius:6px;color:#ffffff;font-family:${FONT};font-size:14px;font-weight:bold;line-height:48px;text-align:center;text-decoration:none;-webkit-text-size-adjust:none;mso-hide:all">${escapeHtml(label)}</a><!--<![endif]-->
</td></tr></table>`;
}

function template({from, to, subject, title, category, preheader, paragraphs, details=[], sections=[], inlineDetails=false, action, note, reason, origin, replyTo}) {
  const support = from === CMS_FROM ? 'it@ifranchise.in' : 'contact@ifranchise.in';
  const logo = safeUrl(`${origin}/assets/ifranchise-email-logo.png`);
  const text = [
    'iFranchise', category, title, ...paragraphs,
    ...details.map(([label, value]) => `${label}: ${value || 'Not provided'}`),
    ...sections.flatMap(section=>[section.title,...section.details.map(([label,value])=>`${label}: ${value || 'Not provided'}`)]),
    action ? `${action.label}: ${safeUrl(action.url)}` : '', note,
    '—', reason, `Need a hand? ${support}`, BRAND.website,
  ].filter(Boolean).join('\n\n');
  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="format-detection" content="telephone=no,date=no,address=no,email=no"><title>${escapeHtml(subject)}</title>
<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}@media screen and (max-width:600px){.email-outer{padding:20px 12px!important}.email-content{padding:28px 24px!important}.email-heading{font-size:26px!important;line-height:34px!important}.email-footer{padding:24px!important}}</style>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office"><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head><body style="margin:0;padding:0;width:100%;background-color:${BRAND.background};color:${BRAND.ink};font-family:${FONT}">
<div style="display:none;font-size:1px;line-height:1px;color:${BRAND.background};max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.background}" style="width:100%"><tr><td class="email-outer" align="center" style="padding:40px 16px">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table class="email-container" role="presentation" width="100%" align="center" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;table-layout:fixed;background-color:#ffffff;border:1px solid ${BRAND.line};border-radius:12px">
<tr><td height="4" bgcolor="${BRAND.purple}" style="height:4px;font-size:0;line-height:0;border-radius:12px 12px 0 0">&nbsp;</td></tr>
<tr><td class="email-content" style="padding:36px 40px 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="text-align:center"><a href="${BRAND.website}" style="text-decoration:none"><img src="${escapeHtml(logo)}" width="176" height="44" alt="iFranchise — Connect. Expand. Grow." style="display:block;margin:0 auto;width:176px;height:44px;max-width:100%;color:${BRAND.purple};font-family:${FONT};font-size:18px;font-weight:bold"></a></td></tr></table>
<p class="email-category" style="margin:28px 0 12px;text-align:center;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.purple}">${escapeHtml(category)}</p>
<h1 class="email-heading" style="margin:0 0 24px;text-align:center;font-family:${FONT};font-size:30px;line-height:38px;font-weight:bold;letter-spacing:-0.6px;color:${BRAND.ink}">${escapeHtml(title)}</h1>
${paragraphs.map(paragraph).join('\n')}
${detailTable(details,inlineDetails)}
${sections.map(section=>`<h2 style="margin:24px 0 12px;font-family:${FONT};font-size:16px;line-height:24px;color:${BRAND.ink}">${escapeHtml(section.title)}</h2>${detailTable(section.details,inlineDetails)}`).join('')}
${action ? primaryAction(action) : ''}
${note ? `<p style="margin:0;font-size:13px;line-height:21px;color:${BRAND.muted}">${escapeHtml(note)}</p>` : ''}
</td></tr>
<tr><td class="email-footer" align="center" style="padding:24px 40px;border-top:1px solid ${BRAND.line};font-family:${FONT};text-align:center">
<p style="margin:0 0 10px;font-size:12px;line-height:20px;color:${BRAND.muted}">${escapeHtml(reason)}</p>
<p style="margin:0 0 14px;font-size:12px;line-height:20px;color:${BRAND.muted}">Need a hand? <a href="mailto:${support}" style="color:${BRAND.purple};text-decoration:underline">${support}</a></p>
<p style="margin:0;font-size:12px;line-height:20px;color:${BRAND.muted}"><a href="${BRAND.website}" style="color:${BRAND.muted};text-decoration:underline">www.ifranchise.in</a></p>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
  return {from, to:Array.isArray(to) ? to : [to], subject, html, text, ...(replyTo ? {reply_to:replyTo} : {})};
}

export function invitationEmail({email, name, role, origin, token}) {
  return template({from:CMS_FROM, to:email, origin, subject:'Your invitation to iFranchise CMS', category:'CMS · Team invitation', title:'You’re invited to iFranchise', preheader:'Your invitation is ready. Join the CMS with your work account.',
    paragraphs:[`Hi ${name},`, 'You’ve been invited to the iFranchise CMS. Accept your invitation to join the team and access your assigned workspace.'],
    details:[['Work account', email], ['Your role', role.replaceAll('_', ' ')]],
    action:{label:'Accept invitation', url:`${origin}/cms/activate#token=${token}`},
    note:'This invitation expires in 14 days and can be accepted only once. Sign in with the work account above through Google Workspace and Cloudflare Access. Keep this invitation private.',
    reason:'You received this invitation from an iFranchise Super Admin. If you weren’t expecting it, contact our IT team.', replyTo:'it@ifranchise.in'});
}

export function activationEmail({email, name, origin}) {
  return template({from:CMS_FROM, to:email, origin, subject:'Your iFranchise CMS access is active', category:'CMS · Account activated', title:'Your CMS access is ready', preheader:'Your invitation has been accepted. Welcome to the team.',
    paragraphs:[`Hi ${name},`, 'Your invitation has been accepted and your CMS access is active. Your assigned sections are ready when you are.'], details:[['Work account', email]],
    action:{label:'Open CMS', url:origin+'/admin'}, note:'Use your Google Workspace work account to sign in. Contact a Super Admin if you need help with your role or permissions.',
    reason:'This confirmation was sent after your iFranchise CMS invitation was accepted.', replyTo:'it@ifranchise.in'});
}

export function accessHelpEmail({email, origin}) {
  return template({from:CMS_FROM, to:email, origin, subject:'Help with your iFranchise CMS access', category:'CMS · Account access', title:'Let’s get you signed in', preheader:'Guidance for recovering access to your Google Workspace work account.',
    paragraphs:['Your work account is your CMS login. Sign-in is managed by Google Workspace through Cloudflare Access; iFranchise CMS does not store a separate password.', 'If you’ve forgotten your work account password, start with Google’s account recovery. If you still need help, contact it@ifranchise.in.'],
    details:[['CMS portal', origin+'/admin']], action:{label:'Google account recovery', url:'https://accounts.google.com/signin/recovery'},
    note:'This email does not change your password or grant access. Your CMS permissions are managed by a Super Admin. If you did not request this email, no action is needed.',
    reason:'You received this guidance following a request for help accessing iFranchise CMS.', replyTo:'it@ifranchise.in'});
}

const adminActions = {
  'invite employee':'Staff invitation created', 'update employee':'Staff access updated', 'accept invitation':'Staff account activated',
  submit:'Content submitted for review', publish:'Content published', reject:'Content returned for changes', archive:'Content archived',
  'retry email':'Email delivery retry requested',
};
export function adminEmail({to, action, actor, reference, origin}) {
  return template({from:CMS_FROM, to, origin, subject:'iFranchise CMS — administrative update', category:'CMS · Activity update', title:adminActions[action] || 'An update in your CMS', preheader:'An administrative action has been recorded in your workspace.',
    paragraphs:['An administrative action was recorded in iFranchise CMS. Open the portal to review the activity and any next steps.'],
    details:[['Action', adminActions[action] || action], ['Performed by', actor], ['Reference', reference]], action:{label:'Review CMS activity', url:origin+'/admin'},
    note:action === 'retry email' ? 'A retry request is not a delivery confirmation. Check Email delivery in the CMS for the latest provider status.' : 'This is an activity notification. It does not change your account permissions.',
    reason:'You received this update because you are a configured recipient of CMS notifications.', replyTo:'it@ifranchise.in'});
}

const websiteKinds = {
  investor:{title:'New franchise enquiry', category:'Website · Franchise enquiries', intro:'Someone is ready to explore their next business opportunity. Their enquiry is saved in the CMS for your team to review.', cta:'Review franchise enquiry'},
  brand:{title:'New brand expansion enquiry', category:'Website · Brand expansion', intro:'A business owner is exploring the next chapter for their brand. Their expansion enquiry is ready for your team.', cta:'Review brand enquiry'},
  general:{title:'New general enquiry', category:'Website · General enquiries', intro:'A new message has arrived through the iFranchise website. Open the enquiry to review the details and follow up.', cta:'Review enquiry'},
  job:{title:'New job application', category:'Website · Careers', intro:'A candidate has applied through the iFranchise website. Their application is ready for the hiring team to review.', cta:'Review application'},
};
function submissionDetails(kind,data){
  const pairs=kind==='investor'?[['Brand',data.brandName||'Help me explore'],['Investment preference',data.budget],['Timeframe',data.timeframe]]:
    kind==='brand'?[['Business name',data.companyName],['Business website',data.companyWebsite],['Expansion timeframe',data.timeframe]]:
    kind==='job'?[['Role',data.jobTitle],['Experience',data.experience],['Employment status',data.employmentStatus],['Notice period',data.noticePeriod],['Qualification',data.qualification],['Course / field of study',data.course],['Qualification status',data.educationStatus],['Institution',data.institution],['LinkedIn / portfolio',data.profile],['Resume link',data.resumeLink]]:[];
  return pairs.filter(([,value])=>value);
}
function enquiryCopy(record){const copy=Object.hasOwn(websiteKinds,record.kind)?websiteKinds[record.kind]:null;if(!copy)throw Error('Unsupported notification');return copy}
export function websiteEmail({to, record, origin, storage = 'cms'}) {
  const data=JSON.parse(record.payload),copy=enquiryCopy(record);
  const date=new Date(record.created_at),received=Number.isNaN(date.getTime())?'Not recorded':new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'}).format(date)+' IST';
  const details=submissionDetails(record.kind,data),message=record.kind==='job'?data.coverNote:data.message;
  if(record.kind==='job'&&record.resume_name){
    details.push(['Resume',record.resume_name+(storage==='sheets'?' (private Google Drive file)':' (available in CMS)')]);
    if(storage==='sheets'&&/^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view$/.test(record.resume_url||''))details.push(['Private resume link',record.resume_url]);
  }
  const sourcePath=safeReturnPath(data.sourcePage);
  // Use the live website for source pages, independently of the email/CMS origin.
  // Preserve the page context without copying query-string credentials or form answers.
  const sourcePage=sourcePath?new URL(new URL(sourcePath,PUBLIC_WEBSITE_ORIGIN).pathname,PUBLIC_WEBSITE_ORIGIN).href:null;
  // Display only campaign fields already saved with a lead. This does not
  // enable tracking or copy arbitrary query strings, IDs or system metadata.
  const attribution=[['Campaign source','utm_source'],['Campaign medium','utm_medium'],['Campaign name','utm_campaign']]
    .flatMap(([label,key])=>typeof data.source?.[key]==='string'&&data.source[key].trim()?[[label,data.source[key].trim().slice(0,200)]]:[]);
  return template({from:WEBSITE_FROM,to,origin,inlineDetails:true,subject:`${copy.title} | iFranchise`,title:copy.title,category:copy.category,preheader:`${copy.title} — ready for your team to review.`,
    paragraphs:[storage==='sheets'?'A new enquiry has been saved in the iFranchise website lead spreadsheet. Review the details below and contact the visitor to follow up.':copy.intro],details:[['Received',received],...(sourcePage?[['Source page',sourcePage]]:[])],
    sections:[{title:'Contact details',details:[['Name',data.name],['Email',data.email],['Phone',data.phone],['State / UT',data.state],['City',data.city]]},
      ...(details.length?[{title:record.kind==='job'?'Application details':'Enquiry details',details}]:[]),
      ...(attribution.length?[{title:'Campaign attribution (visitor supplied)',details:attribution}]:[]),
      ...(message?[{title:record.kind==='job'?'Cover note':'Message',details:[['From the visitor',message]]}]:[])],
    action:storage==='sheets'?undefined:record.id?{label:copy.cta,url:`${origin}/admin/inbox/${encodeURIComponent(record.id)}`}:{label:copy.cta,url:origin+'/admin/inbox'},
    note:storage==='sheets'?'Reply to this email to contact the visitor.':'Sign in with your work account to review this submission. Reply to this email to contact the sender.',
    reason:'This notification was sent to the iFranchise team after a website submission was saved.',replyTo:data.email});
}
export function websiteConfirmationEmail({record,origin}){
  const data=JSON.parse(record.payload);enquiryCopy(record);
  const job=record.kind==='job',type=job?'application':record.kind==='brand'?'brand expansion enquiry':record.kind==='investor'?'franchise enquiry':'enquiry';
  const summary=job?[['Role',data.jobTitle]]:record.kind==='brand'?[['Business',data.companyName]]:record.kind==='investor'?[['Brand',data.brandName||'Exploring opportunities'],['Investment preference',data.budget]]:[];
  return template({from:WEBSITE_FROM,to:data.email,origin,subject:`We’ve received your ${type} | iFranchise`,title:job?'Your application is with us':'Thank you for getting in touch',category:job?'Careers · Application received':'Enquiry received',preheader:`Your ${type} has been safely received.`,
    paragraphs:[`Hi ${data.name},`,`Thank you for ${job?'your interest in joining iFranchise':record.kind==='brand'?'sharing your expansion plans with iFranchise':'getting in touch with iFranchise'}. We’ve received your ${type}.`,job?'Our hiring team will review your application and get in touch about the next steps.':'Our team will review your enquiry and get in touch to discuss the next steps.'],
    details:[...summary,['Location',[data.city,data.state].filter(Boolean).join(', ')]].filter(([,value])=>value),
    action:{label:job?'Visit iFranchise':'Explore opportunities',url:origin+(job?'/':'/franchise-opportunities')},
    note:'Your details are saved. There’s no need to submit again. If you have anything to add, reply to this email.',
    reason:`You received this confirmation because ${/^[aeiou]/.test(type)?'an':'a'} ${type} was submitted using this email address. If this wasn’t you, contact us.`,replyTo:'contact@ifranchise.in'});
}
