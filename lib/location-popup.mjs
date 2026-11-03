// Keep suggestions inside the visible viewport, including an on-screen keyboard.
export function locationPopup(rect, viewport) {
 const gap=6, edge=12, bottom=viewport.top+viewport.height-edge;
 const below=Math.max(0,bottom-rect.bottom-gap), above=Math.max(0,rect.top-viewport.top-edge-gap);
 const height=Math.min(220,Math.max(below,above));
 const placeAbove=below<150&&above>below;
 const maxHeight=Math.max(44,placeAbove?height:Math.min(220,below));
 const top=Math.max(viewport.top+edge,Math.min(bottom-maxHeight,placeAbove?rect.top-gap-maxHeight:rect.bottom+gap));
 return {left:Math.max(edge,Math.min(rect.left,viewport.width-rect.width-edge)),width:Math.min(rect.width,viewport.width-edge*2),top,maxHeight};
}
