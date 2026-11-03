let current=new Headers();
export function setHeaders(values){current=new Headers(values);}
export async function headers(){return current;}
export async function cookies(){return {get(name){const value=current.get('cookie')?.split(';').map(part=>part.trim()).find(part=>part.startsWith(name+'='))?.slice(name.length+1);return value?{value:decodeURIComponent(value)}:undefined;}};}
