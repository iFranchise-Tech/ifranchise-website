export function scrollbarGeometry(viewport,content,scroll){
 const max=Math.max(0,content-viewport),height=Math.min(viewport,Math.max(36,viewport*viewport/Math.max(viewport,content))),travel=Math.max(0,viewport-height);
 return {height,travel,max,top:max?Math.max(0,Math.min(max,scroll))/max*travel:0};
}
export function scrollFromThumb(delta,max,travel){return travel>0?delta/travel*max:0;}
