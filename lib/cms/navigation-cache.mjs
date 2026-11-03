/** One-shot, short-lived intent prefetches. Never persist CMS responses. */
export function createNavigationCache(fetcher, {now=Date.now, ttl=5000, limit=8, retain=false}={}) {
 const entries=new Map();
 function existing(key) {
  const entry=entries.get(key);
  if(entry&&now()-entry.started<ttl)return entry;
  entries.delete(key);
 }
 function prefetch(key) {
  if(existing(key))return;
  while(entries.size>=limit)entries.delete(entries.keys().next().value);
  const entry={started:now(),promise:Promise.resolve().then(()=>fetcher(key))};
  entries.set(key,entry);
  // A failed speculative request must not poison the next real navigation.
  entry.promise.catch(()=>{if(entries.get(key)===entry)entries.delete(key)});
 }
 function read(key, fresh=false) {
  if(retain){if(fresh)entries.delete(key);prefetch(key);return entries.get(key).promise;}
  const entry=fresh?undefined:existing(key);
  entries.delete(key);
  return entry?.promise??fetcher(key);
 }
 return {prefetch,read,clear:()=>entries.clear()};
}
