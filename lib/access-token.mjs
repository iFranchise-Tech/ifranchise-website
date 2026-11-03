import {createRemoteJWKSet, jwtVerify} from 'jose';
const keysets = new Map();
export async function verifyAccessToken(token, config, testKeyset) {
  if (!token || !config.ACCESS_TEAM_DOMAIN || !config.ACCESS_AUD) return null;
  try {
    const configured = new URL(config.ACCESS_TEAM_DOMAIN);
    const issuer = configured.origin;
    if (configured.protocol !== 'https:' || !configured.hostname.endsWith('.cloudflareaccess.com') || configured.username || configured.password || configured.port) return null;
    let keys = testKeyset || keysets.get(issuer);
    if (!keys) { keys = createRemoteJWKSet(new URL('/cdn-cgi/access/certs',issuer)); keysets.set(issuer,keys); }
    const {payload} = await jwtVerify(token,keys,{issuer,audience:config.ACCESS_AUD,algorithms:['RS256'],requiredClaims:['sub','email','exp','iat']});
    if (typeof payload.email !== 'string' || !payload.email.trim() || payload.email_verified === false || typeof payload.sub !== 'string' || !payload.sub) return null;
    return {userId:payload.sub,email:payload.email.trim().toLowerCase(),fullName:typeof payload.name === 'string'?payload.name:null};
  } catch { return null; }
}
