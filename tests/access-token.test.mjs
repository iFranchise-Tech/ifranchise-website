import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPair,SignJWT,exportJWK,createLocalJWKSet} from 'jose';
import {verifyAccessToken} from '../lib/access-token.mjs';
const {privateKey,publicKey}=await generateKeyPair('RS256');
const jwk=await exportJWK(publicKey);jwk.kid='test';jwk.alg='RS256';
const keys=createLocalJWKSet({keys:[jwk]});
const config={ACCESS_TEAM_DOMAIN:'https://test.cloudflareaccess.com',ACCESS_AUD:'website'};
async function token(overrides={}){return new SignJWT({sub:'test-user',email:'ADMIN@IFRANCHISE.IN',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+60,iss:config.ACCESS_TEAM_DOMAIN,aud:'website',...overrides}).setProtectedHeader({alg:'RS256',kid:'test'}).sign(privateKey)}
test('independent identity accepts a signed matching JWT',async()=>assert.equal((await verifyAccessToken(await token(),config,keys)).email,'admin@ifranchise.in'));
test('identity fails closed for invalid audience, issuer, expiry, or unsigned input',async()=>{for(const overrides of [{aud:'wrong'},{iss:'https://wrong.cloudflareaccess.com'},{exp:1},{email:null},{sub:null}])assert.equal(await verifyAccessToken(await token(overrides),config,keys),null);assert.equal(await verifyAccessToken('unsigned',config,keys),null)});
test('missing or insecure identity configuration is rejected',async()=>{for(const c of [{},{...config,ACCESS_AUD:''},{...config,ACCESS_TEAM_DOMAIN:'http://test.cloudflareaccess.com'},{...config,ACCESS_TEAM_DOMAIN:'https://attacker.invalid'}])assert.equal(await verifyAccessToken(await token(),c,keys),null)});
