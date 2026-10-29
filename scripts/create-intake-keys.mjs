import {generateKeyPairSync} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
await mkdir('.secrets',{recursive:true,mode:0o700});
await writeFile('.secrets/intake-private.jwk.json',JSON.stringify(privateKey.export({format:'jwk'})),{flag:'wx',mode:0o600});
await writeFile('.secrets/intake-public.jwk.json',JSON.stringify(publicKey.export({format:'jwk'})),{flag:'wx',mode:0o600});
console.log('Keys created in .secrets/. Store the private key securely; use only the public key in the receiver.');
