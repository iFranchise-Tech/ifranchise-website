export function internalPage(href, base) {
 try {const u=new URL(href,base),b=new URL(base);if(u.origin!==b.origin||!/^https?:$/.test(u.protocol)||/^\/(?:api|admin|assets|brands|optimized|downloads|brochures)(?:\/|$)/.test(u.pathname)||/\.[a-z0-9]{2,6}$/i.test(u.pathname))return null;return u.pathname+u.search+u.hash}catch{return null}
}
export function anchorTop(rectTop, scrollY, headerHeight) {return Math.max(0,Math.round(rectTop+scrollY-headerHeight-16))}
