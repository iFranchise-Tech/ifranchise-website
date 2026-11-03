/** Short-lived, instance-local intent prefetches. Never persist CMS responses. */
export function createNavigationCache(fetcher, {now=Date.now, ttl=5000, limit=16, retain=false}={}) {
 const entries=new Map();
 function existing(key) {
  const entry=entries.get(key);
  // A slow request is still shared. Freshness starts when data arrives, not
  // when a speculative request began waiting for the network.
  if(entry&&(entry.completed===undefined||now()-entry.completed<ttl))return entry;
  entries.delete(key);
 }
 function prefetch(key) {
  if(existing(key))return;
  while(entries.size>=limit)entries.delete(entries.keys().next().value);
  const entry={completed:undefined,value:undefined,promise:undefined};
  entry.promise=Promise.resolve().then(()=>fetcher(key)).then(value=>{entry.value=value;entry.completed=now();return value});
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
 return {prefetch,read,peek:key=>existing(key)?.value,clear:()=>entries.clear()};
}
