const key = value => value.trim().replace(/\s+/g, ' ').toLowerCase();
/** Display aliases once, without rewriting any catalogue or saved values. */
export function locationFormatOptions(catalogue, selected = []) {
  const groups = new Map();
  for (const value of [...catalogue, ...selected]) {
    if (typeof value !== 'string' || !value.trim()) continue;
    const id = key(value);
    if (!groups.has(id)) groups.set(id, {value, label:id.charAt(0).toUpperCase()+id.slice(1), aliases:[]});
    const group = groups.get(id);
    if (!group.aliases.includes(value)) group.aliases.push(value);
  }
  return [...groups.values()];
}
export function toggleLocationFormat(selected, option, checked) {
  if (!checked) return selected.filter(value => !option.aliases.includes(value));
  return selected.some(value => option.aliases.includes(value)) ? selected : [...selected, option.value];
}
