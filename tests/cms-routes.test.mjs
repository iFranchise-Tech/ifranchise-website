import test from 'node:test';
import assert from 'node:assert/strict';
import {adminModules,adminRoute,modulePath,recordPath,canOpenAdminRoute,listingParams,withAdminQuery,safeAdminReturnPath} from '../lib/cms/routes.mjs';
import {isStaffPath} from '../lib/access-gate.mjs';

test('every module has a distinct protected route, including hidden retained modules',()=>{
 const paths=Object.keys(adminModules).map(modulePath);assert.equal(new Set(paths).size,15);
 for(const section of Object.keys(adminModules)){const path=modulePath(section);assert.deepEqual(adminRoute(path),{section,mode:'list'});assert.ok(isStaffPath(path));assert.ok(isStaffPath(path+'.rsc'));}
});
test('record routes retain their exact kind and slug and support ordering and previews',()=>{
 for(const kind of ['franchises','jobs','blogs','articles','videos','pages','faqs','industries'])for(const slug of ['example-record','new','arrange']){
  const id=kind+':'+slug,path=recordPath(id);assert.equal(adminRoute(path).id,id);assert.equal(adminRoute(path+'/preview').mode,'preview');assert.equal(adminRoute(path+'/edit').id,id);
 }
 for(const kind of ['jobs','franchises'])assert.equal(adminRoute(recordPath('placements:'+kind)).id,'placements:'+kind);
 assert.equal(adminRoute('/admin/inbox/submission-123').id,'submission-123');
 assert.equal(adminRoute('/admin/team/person%40ifranchise.in').email,'person@ifranchise.in');
 assert.equal(adminRoute('/admin/team/invite').mode,'invite');
});
test('invalid routes cannot masquerade as another module or create restricted records',()=>{
 for(const path of ['/admin/unknown','/admin/blogs/jobs:other','/admin/blogs/../team','/admin/blogs/a/b','/admin/blogs/a%2Fb','/admin/blogs/%00','/admin/blogs/%','/admin/website-pages/new','/admin/page-faqs/new','/admin/email-delivery/new','/admin/team/a/b','/adminish'])assert.equal(adminRoute(path),null,path);
});
test('URL access honors staff view/edit scope and Super Admin restrictions',()=>{
 const viewer={role:'viewer',status:'active',scopes:['blogs']},editor={role:'editor',status:'active',scopes:['blogs']},admin={role:'super_admin',status:'active'};
 assert.equal(canOpenAdminRoute(viewer,adminRoute('/admin/blogs')),true);assert.equal(canOpenAdminRoute(viewer,adminRoute('/admin/blogs/new')),false);
 assert.equal(canOpenAdminRoute(editor,adminRoute('/admin/blogs/new')),true);assert.equal(canOpenAdminRoute(editor,adminRoute('/admin/careers')),false);
 for(const path of ['/admin/team','/admin/team/invite','/admin/email-delivery']){assert.equal(canOpenAdminRoute(editor,adminRoute(path)),false);assert.equal(canOpenAdminRoute(admin,adminRoute(path)),true)}
 assert.equal(canOpenAdminRoute({...admin,status:'suspended'},adminRoute('/admin/team')),false);
});
test('query state is restored and canonical changes preserve other filters',()=>{
 assert.deepEqual(listingParams('?q=coffee&status=draft&industry=Food&page=3'),{query:'coffee',status:'draft',industry:'Food',page:3});
 for(const page of ['0','-1','NaN','1.5','Infinity'])assert.equal(listingParams('page='+page).page,1);
 assert.equal(withAdminQuery('/admin/blogs','q=test&page=3&status=draft',{page:1,status:'all'}),'/admin/blogs?q=test');
 assert.equal(withAdminQuery('/admin/inbox','type=job',{page:2,sync:'pending'}),'/admin/inbox?type=job&page=2&sync=pending');
});
test('post-login destinations reject external, traversal and header injection URLs',()=>{
 for(const path of ['https://evil.test','//evil.test','/admin/../../evil','/adminish','/admin\\evil','/admin\r\nLocation: evil'])assert.equal(safeAdminReturnPath(path),'/admin');
 assert.equal(safeAdminReturnPath('/admin/careers/example?tab=history'),'/admin/careers/example?tab=history');
});
