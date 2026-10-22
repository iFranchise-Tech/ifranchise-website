import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const members=sqliteTable('cms_members',{
 email:text('email').primaryKey(), userId:text('user_id').unique(), name:text('name').notNull(),
 role:text('role').notNull(), scopes:text('scopes').notNull(), manager:text('manager'),
 status:text('status').notNull(), expiresAt:text('expires_at'), version:integer('version').notNull().default(1),
 createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
});
export const records=sqliteTable('cms_records',{
 id:text('id').primaryKey(), kind:text('kind').notNull(), slug:text('slug').notNull(),
 draft:text('draft').notNull(), live:text('live'),status:text('status').notNull(),intent:text('intent').notNull().default('publish'),
 version:integer('version').notNull(), updatedBy:text('updated_by').notNull(),submittedBy:text('submitted_by'),
 updatedAt:text('updated_at').notNull(),mutation:text('mutation').notNull(),
},t=>[index('cms_records_kind').on(t.kind)]);
export const events=sqliteTable('cms_events',{
 id:text('id').primaryKey(),recordId:text('record_id').notNull(),action:text('action').notNull(),actor:text('actor').notNull(),
 snapshot:text('snapshot'),note:text('note').notNull(),createdAt:text('created_at').notNull(),
},t=>[index('cms_events_record').on(t.recordId,t.createdAt)]);
export const media=sqliteTable('cms_media',{
 id:text('id').primaryKey(),name:text('name').notNull(),mime:text('mime').notNull(),size:integer('size').notNull(),
 scope:text('scope').notNull(),uploadedBy:text('uploaded_by').notNull(),createdAt:text('created_at').notNull(),
});

export const previews=sqliteTable('cms_previews',{id:text('id').primaryKey(),kind:text('kind').notNull(),payload:text('payload').notNull(),createdBy:text('created_by').notNull(),expiresAt:text('expires_at').notNull()});

export const intakeSessions=sqliteTable('intake_sessions',{id:text('id').primaryKey(),ipHash:text('ip_hash').notNull(),createdAt:integer('created_at').notNull(),expiresAt:integer('expires_at').notNull()});
export const submissions=sqliteTable('website_submissions',{
 id:text('id').primaryKey(),reference:text('reference').notNull().unique(),sessionId:text('session_id').notNull().unique(),
 kind:text('kind').notNull(),payload:text('payload').notNull(),resumeKey:text('resume_key'),resumeName:text('resume_name'),
 createdAt:text('created_at').notNull(),sheetStatus:text('sheet_status').notNull().default('pending'),syncedAt:text('synced_at'),attempts:integer('attempts').notNull().default(0),
},t=>[index('website_submissions_pending').on(t.sheetStatus,t.createdAt)]);
export const intakeLimits=sqliteTable('intake_limits',{id:text('id').primaryKey(),count:integer('count').notNull(),expiresAt:integer('expires_at').notNull()});
