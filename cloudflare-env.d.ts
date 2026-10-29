declare namespace Cloudflare {interface Env {ASSETS?:Fetcher; DB?:D1Database; BUCKET?:R2Bucket; SITE_ACCESS?:string; CMS_SUPER_ADMIN_EMAIL?:string; ACCESS_TEAM_DOMAIN?:string; ACCESS_AUD?:string; SHEETS_WEBHOOK_URL?:string; INTAKE_SIGNING_KEY?:string;}}
interface ImportMeta {readonly env: {readonly DEV: boolean; readonly PROD:boolean; [key:string]:unknown};}
