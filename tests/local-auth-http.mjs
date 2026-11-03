// Local-only smoke checks. Account choices need no password. Session cookies are never logged.
import assert from 'node:assert/strict';
const origins=process.argv.slice(2);
if(!origins.length)origins.push('http://localhost:3019','http://127.0.0.1:3019');
let checks=0;
for(const base of origins){
 assert.match(base,/^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
 const get=(path,headers={})=>fetch(base+path,{headers,redirect:'manual'});
 const login=(email)=>fetch(base+'/api/admin/local-dev-session',{method:'POST',redirect:'manual',headers:{origin:base,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({email})});
 for(const path of ['/admin','/admin?_rsc=stale']){
  const response=await get(path,{accept:'text/html'}),html=await response.text();
  assert.equal(response.status,401);assert.match(html,/<h1[^>]*>CMS Portal/);assert.match(html,/name="email"/);assert.doesNotMatch(html,/type="password"|name="secret"|data-toggle-secret/);assert.match(html,/Choose your account/);assert.match(html,/hidden role="note"/);assert.doesNotMatch(html,/Cloudflare Access cannot|Local development only/);checks++;
 }
 for(const path of ['/admin?_rsc=probe','/admin.rsc','/admin/preview.rsc']){
  const response=await fetch(base+path,{headers:{accept:'text/x-component',rsc:'1'}}),body=await response.text();
  assert.match(response.headers.get('content-type'),/text\/x-component/);assert.match(body,/CMS Portal/);assert.doesNotMatch(body,/Welcome back,/);checks++;
 }
 for(const path of ['/api/admin','/api/admin/intake','/api/admin/upload']){
  const response=await get(path);assert.equal(response.status,401);assert.equal((await response.json()).error,'Sign in to continue.');checks++;
 }
 for(const email of ['abdul@ifranchise.in','sumanth.reddy@ifranchise.in']){
  const invalid=await login('not-in-picker@ifranchise.in');assert.equal(invalid.status,303);assert.equal(invalid.headers.get('location'),'/admin?error=credentials');
  const error=await get('/admin?error=credentials');assert.match(await error.text(),/role="alert">Choose one of the available accounts/);
  const response=await login(email);assert.equal(response.status,303);assert.equal(response.headers.get('location'),'/admin');
  const cookie=response.headers.get('set-cookie')?.split(';')[0];assert(cookie);assert.match(response.headers.get('set-cookie'),/HttpOnly/);
  const api=await get('/api/admin',{cookie});assert.equal(api.status,200);const data=await api.json();assert.equal(data.me.email,email);assert.equal(data.me.role,'super_admin');
  const dashboard=await get('/admin',{cookie});assert.equal(dashboard.status,200);assert.match(await dashboard.text(),/Welcome back/);assert.equal(dashboard.headers.get('cache-control'),'no-store');
  const team=await get('/api/admin?view=team',{cookie});assert.equal(team.status,200);
  const firstMembers=(await team.json()).members;
  await get('/api/admin',{cookie});
  const nextMembers=await (await get('/api/admin?view=team',{cookie})).json();
  assert.equal(firstMembers.find(m=>m.email===email).version,nextMembers.members.find(m=>m.email===email).version,'identity reads must not invalidate invitation versions');
  const forbidden=await fetch(base+'/api/admin/local-dev-logout',{method:'POST',redirect:'manual',headers:{cookie,origin:'https://example.com'}});assert.equal(forbidden.status,403);
  const logout=await fetch(base+'/api/admin/local-dev-logout',{method:'POST',redirect:'manual',headers:{cookie,origin:base}});assert.equal(logout.status,303);assert.match(logout.headers.get('set-cookie'),/Max-Age=0/);
  assert.equal((await get('/api/admin',{cookie})).status,401,'replaying a signed-out token must fail');
  assert.match(await (await get('/admin',{cookie})).text(),/<h1[^>]*>CMS Portal/);
  checks+=12;
 }
 for(const path of ['/','/contact-us','/franchise-opportunities']){assert.equal((await get(path)).status,200);checks++;}
 const invalidEnquiry=await fetch(base+'/api/intake/enquiries',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:'{}'});assert.equal(invalidEnquiry.status,422);checks++;
 const session=await fetch(base+'/api/intake/session',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:'{}'});assert.equal(session.status,200);assert((await session.json()).token);checks++;
 console.log(`PASS local login, dashboard, revocation, protected APIs and public routes: ${base}`);
}
console.log(`${checks} local HTTP checks passed.`);
