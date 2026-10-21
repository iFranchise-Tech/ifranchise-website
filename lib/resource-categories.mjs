export const resourceCategories = [
  {id:'for-investors',label:'For investors'},
  {id:'for-brands',label:'For brands'},
  {id:'franchise-basics',label:'Franchise basics'},
  {id:'industries',label:'Industry guides'},
];

export function validResourceCategory(value) {
  return resourceCategories.some(category => category.id === value);
}

// Imported posts retain their editorial topics; an explicit CMS category takes priority.
export function resourceCategory(item) {
  if (validResourceCategory(item.resourceCategory)) return item.resourceCategory;
  const topic = String(item.category || item.label || '').trim().toLowerCase();
  if (['industries','industry guides'].includes(topic)) return 'industries';
  if (['fundamentals','franchise basics','operating models'].includes(topic)) return 'franchise-basics';
  if (item.audience === 'brand') return 'for-brands';
  if (item.audience === 'investor') return 'for-investors';
  return 'franchise-basics';
}

export function resourceCategoryLabel(item) {
  return resourceCategories.find(category => category.id === resourceCategory(item)).label;
}

export function filterResources(items, {category='all',topic='all',query=''}={}) {
  const search = query.trim().toLowerCase();
  return items.filter(item =>
    (category === 'all' || (['Blog','Article'].includes(item.type) && resourceCategory(item) === category)) &&
    (topic === 'all' || item.category === topic) &&
    [item.title,item.excerpt,item.category,...(['Blog','Article'].includes(item.type)?[resourceCategoryLabel(item)]:[])].join(' ').toLowerCase().includes(search)
  );
}
