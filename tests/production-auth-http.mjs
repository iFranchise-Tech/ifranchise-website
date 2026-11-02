// Exercises only loopback servers; credentials and session tokens stay in memory.
import assert from 'node:assert/strict';
const [dev='http://localhost:3021',production='http://127.0.0.1:3023']=process.argv.slice(2);
for(const origin of [dev,production])assert.match(origin,/^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
const login=await fetch(dev+'/api/admin/local-dev-session',{method:'POST',redirect:'manual',headers:{origin:dev,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({email:'abdul@ifranchise.in'})});
assert.equal(login.status,303);
const cookie=login.headers.get('set-cookie').split(';')[0];
for(const path of ['/api/admin','/api/admin/intake','/api/admin/local-dev-session','/api/admin/local-dev-logout']){
 for(const headers of [{cookie},{'cf-access-jwt-assertion':'forged.jwt.value'},{'oai-authenticated-user-email':'abdul@ifranchise.in','oai-authenticated-user-id':'forged'}]){
  const response=await fetch(production+path,{method:path.includes('local-dev-')?'POST':'GET',headers:{...headers,origin:production},redirect:'manual'});
  assert.equal(response.status,401,path);assert.equal(response.headers.get('set-cookie'),null);
 }
}
const page=await fetch(production+'/admin',{headers:{cookie}}),html=await page.text();
assert.equal(page.status,401);assert.match(html,/<h1[^>]*>CMS Portal/);assert.doesNotMatch(html,/type="password"|local-dev-session/);assert.match(html,/company identity provider/);
const rsc=await fetch(production+'/admin.rsc',{headers:{cookie,accept:'text/x-component',rsc:'1'}});const component=await rsc.text();assert.match(component,/CMS Portal/);assert.doesNotMatch(component,/Welcome back,/);
assert.equal((await fetch(production+'/')).status,200);
await fetch(dev+'/api/admin/local-dev-logout',{method:'POST',headers:{origin:dev,cookie}});
console.log('PASS compiled production Worker: rejects valid local cookies, forged JWTs and identity headers; local login/logout disabled; guarded HTML/RSC login; public homepage accessible.');
