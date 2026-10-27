const resourceKinds=['articles','blogs','videos'];

// Start independent queries together; a single collection never needs the
// full article bodies belonging to the other collections.
/** @template T
 * @param {(kind:string)=>Promise<T[]>} load
 * @param {string} mode
 * @returns {Promise<Record<string,T[]>>}
 */
export async function loadResourceCollections(load,mode='all'){
 const kinds=resourceKinds.includes(mode)?[mode]:resourceKinds;
 return Object.fromEntries(await Promise.all(kinds.map(async kind=>[kind,await load(kind)])));
}
