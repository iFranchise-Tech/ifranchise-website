import test from 'node:test';
import assert from 'node:assert/strict';
import {randomToken,tokenHash,seal,unseal,verifyWebhook} from '../lib/email/crypto.mjs';
import {invitationEmail,websiteEmail,accessHelpEmail,activationEmail,adminEmail} from '../lib/email/templates.mjs';
test('invitation tokens use 256 random bits; only a digest is used for lookup',async()=>{
 const tokens=Array.from({length:100},randomToken);assert.equal(new Set(tokens).size,100);
 for(const token of tokens)assert.match(token,/^[A-Za-z0-9_-]{43}$/);
 assert.equal((await tokenHash(tokens[0])).length,64);assert.notEqual(await tokenHash(tokens[0]),tokens[0]);
});
test('outbox encryption authenticates both the message and its row identity',async()=>{
 const key=Buffer.alloc(32,3).toString('base64'),message={token:randomToken(),to:'staff@ifranchise.in'};
 const sealed=await seal(message,key,'row-one');assert(!sealed.includes(message.token));
 assert.deepEqual(await unseal(sealed,key,'row-one'),message);
 await assert.rejects(()=>unseal(sealed,key,'row-two'));
 await assert.rejects(()=>unseal(sealed,Buffer.alloc(32,4).toString('base64'),'row-one'));
});
test('webhook verification matches the published Svix test vector and rejects tampering/replay',async()=>{
 const body='{"event_type":"ping","data":{"success":true}}',secret='whsec_plJ3nmyCDGBKInavdOK15jsl';
 const headers=new Headers({'svix-id':'msg_loFOjxBNrRLzqYUf','svix-timestamp':'1731705121','svix-signature':'v1,rAvfW3dJ/X/qxhsaXPOyyCGmRKsaKWcsNccKXlIktD0='});
 assert.equal(await verifyWebhook(body,headers,secret,1731705121000),'msg_loFOjxBNrRLzqYUf');
 await assert.rejects(()=>verifyWebhook(body+' ',headers,secret,1731705121000));
 await assert.rejects(()=>verifyWebhook(body,headers,secret,1731705501000));
 await assert.rejects(()=>verifyWebhook(body,headers,secret,1731704701000));
 headers.set('svix-signature','v1,invalid '+headers.get('svix-signature'));assert(await verifyWebhook(body,headers,secret,1731705121000));
});
test('templates escape input, use the right sender, and do not invent password reset credentials',()=>{
 const origin='https://preview.example';
 const invite=invitationEmail({email:'staff@ifranchise.in',name:'<script>alert(1)</script>',role:'editor',origin,token:'x'.repeat(43)});
 assert.equal(invite.from,'iFranchise <it@ifranchise.in>');assert(!invite.html.includes('<script>'));assert.match(invite.html,/#token=/);assert.match(invite.text,/14 days/);
 for(const kind of ['investor','brand','general','job']){
  const message=websiteEmail({to:['contact@ifranchise.in'],origin,record:{kind,reference:'IF-test',payload:JSON.stringify({name:'<img src=x>',email:'test@outlook.com',message:'PRIVATE MESSAGE',jobTitle:'Engineer'}),resume_key:'PRIVATE RESUME'}});
  assert.match(message.from,/contact@ifranchise.in/);assert.equal(message.reply_to,'test@outlook.com');assert(!message.html.includes('PRIVATE'));assert(!message.html.includes('<img src=x>'));
 }
 const help=accessHelpEmail({email:'staff@ifranchise.in',origin});assert.match(help.text,/does not change your password/);assert(!help.html.includes('token='));
 assert.match(activationEmail({email:'staff@ifranchise.in',name:'Staff',origin}).from,/it@ifranchise.in/);
 assert.match(adminEmail({to:['it@ifranchise.in'],action:'invite',actor:'admin',reference:'one',origin}).from,/it@ifranchise.in/);
});
