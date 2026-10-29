import {createRemoteJWKSet, jwtVerify} from 'jose';
const keysets = new Map();
export async function verifyAccessToken(token, config, testKeyset) {
  if (!token || !config.ACCESS_TEAM_DOMAIN || !config.ACCESS_AUD) return null;
  try {
    const issuer = new URL(config.ACCESS_TEAM_DOMAIN).origin;
    if (!issuer.startsWith('https://') || !new URL(issuer).hostname.endsWith('.cloudflareaccess.com')) return null;
    let keys = testKeyset || keysets.get(issuer);
    if (!keys) { keys = createRemoteJWKSet(new URL('/cdn-cgi/access/certs',issuer)); keysets.set(issuer,keys); }
    const {payload} = await jwtVerify(token,keys,{issuer,audience:config.ACCESS_AUD,algorithms:['RS256'],requiredClaims:['sub','email','exp','iat']});
    if (typeof payload.email !== 'string' || typeof payload.sub !== 'string' || !payload.sub) return null;
    return {userId:payload.sub,email:payload.email.trim().toLowerCase(),fullName:typeof payload.name === 'string'?payload.name:null};
  } catch { return null; }
}
