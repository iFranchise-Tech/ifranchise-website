export class CmsError extends Error { constructor(public status:number,message:string){super(message)} }
