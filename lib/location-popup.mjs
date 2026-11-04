// Anchor suggestions below their field, including when the keyboard reduces space.
export function locationPopup(rect, viewport) {
 const gap=6, edge=12, bottom=viewport.top+viewport.height-edge;
 const top=rect.bottom+gap, maxHeight=Math.max(0,Math.min(220,bottom-top));
 // Never leave a floating list behind when its field scrolls out of view.
 const visible=rect.top>=viewport.top&&maxHeight>=58;
 return {left:Math.max(edge,Math.min(rect.left,viewport.width-rect.width-edge)),width:Math.min(rect.width,viewport.width-edge*2),top,maxHeight,visibility:visible?'visible':'hidden'};
}
