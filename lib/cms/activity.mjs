const modules = {
  franchises:'Franchise opportunities', jobs:'Careers', industries:'Industries',
  blogs:'Blogs', articles:'Articles', videos:'Videos', faqs:'Page FAQs',
  pages:'Website pages', team:'Team & access', intake:'Inbox', email:'Email delivery',
};
const actions = {
  save:'Saved draft', submit:'Submitted for review', publish:'Published content',
  reject:'Requested changes', withdraw:'Withdrew review submission',
  // An archive event can be a removal request or a completed removal.
  archive:'Recorded removal action', restore:'Restored item as draft',
  revert:'Restored revision as draft', 'original version':'Preserved original version',
  'invite employee':'Invited employee', 'update employee':'Updated employee access',
  'accept invitation':'Activated account', upload:'Uploaded file',
  'view submissions':'Viewed submissions', 'view submission':'Viewed submission',
  'download resume':'Downloaded résumé', 'privacy request status':'Updated privacy request status',
  'retry email':'Requested email retry',
  'secure brochure import':'Imported secure brochure',
};
const privacyStatuses = new Set(['Received','Awaiting verification','In progress','Completed']);

// Presentation only. The original audit event is retained unchanged. Names are
// resolved from records/members already loaded by the permission-checked API.
export function activityDisplay(event, records = [], members = []) {
  const id = String(event.record_id || ''), [scope, key] = id.split(':');
  const member = members.find(m => m.email === event.actor);
  const record = records.find(r => r.id === id);
  let moduleName = modules[scope] || 'CMS';
  let target = record?.draft?.name || record?.draft?.title || record?.live?.name || record?.live?.title || 'Record unavailable';
  if (scope === 'placements') {
    moduleName = key === 'jobs' ? 'Careers' : key === 'franchises' ? 'Franchise opportunities' : 'CMS';
    target = key === 'jobs' ? 'Job display order' : key === 'franchises' ? 'Franchise display order' : 'Display order';
  } else if (scope === 'team') {
    const employee = members.find(m => m.email === key);
    target = employee?.name || (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key || '') ? key : 'Employee account');
  } else if (scope === 'intake') {
    target = event.action === 'view submissions' ? 'Submission list'
      : event.action === 'download resume' ? 'Job application'
      : event.action === 'privacy request status' ? 'Privacy request' : 'Submission';
  } else if (scope === 'email') target = 'Transactional email';
  else if (event.action === 'upload' && key === 'media') target = typeof event.note === 'string' && /\.(png|jpe?g|webp|pdf)$/i.test(event.note) ? event.note : 'Media file';

  return {
    action:actions[event.action] || 'Recorded activity', module:moduleName, target,
    actorName:member?.name || '', actorEmail:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.actor || '') ? event.actor : '',
    // Intake list notes contain submission IDs; team notes contain internal
    // role/status values. Neither belongs in the activity feed.
    detail:event.action === 'privacy request status' && privacyStatuses.has(event.note) ? event.note : '',
  };
}
