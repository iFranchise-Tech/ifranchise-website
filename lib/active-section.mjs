/** Choose the section at the reading line, including long and final sections.
 * @param {{id:string,top:number}[]} sections
 * @param {number} line
 * @param {boolean} atPageEnd
 */
export function activeReadingSection(sections, line, atPageEnd = false) {
  if (!sections.length) return '';
  if (atPageEnd) return sections[sections.length - 1].id;
  let active = sections[0].id;
  for (const section of sections) {
    if (section.top > line) break;
    active = section.id;
  }
  return active;
}
