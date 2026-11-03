import {headers} from 'next/headers';
import {env} from 'cloudflare:workers';
import {BrandIdentity} from '../brand-identity';
import {accessSignOutPath} from '../../lib/access-auth';
import {STAFF_ACCESS_HELP_HREF, STAFF_ACCESS_HELP_LABEL, STAFF_PORTAL_INTRO, STAFF_SIGN_IN_ACTION, describeStaffSignIn} from '../../lib/access-login.mjs';
import {LOCAL_ADMIN_PATH, LOCAL_ADMIN_LOGOUT, describeLocalSignIn} from '../../lib/local-admin.mjs';
import {ForgotPasswordHelp} from './forgot-password-help';
import {StaffReturnPath,StaffAccessLink} from './sign-in-destination';

export async function StaffSignIn({status, message, returnPath}: {status: number; message: string; returnPath: string}) {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') || '';
  const protocol = requestHeaders.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const requestUrl = `${protocol}://${host}${returnPath}`;
  const signIn = describeStaffSignIn({teamDomain: env.ACCESS_TEAM_DOMAIN, audience: env.ACCESS_AUD, requestUrl});
  const local = describeLocalSignIn({dev: import.meta.env.DEV === true, requestUrl, env});
  const denied = status !== 401;
  const notices = local.enabled ? [local.missing].filter(Boolean) : signIn.notices;
  return <main className="cms-access"><section aria-labelledby="staff-sign-in-title">
    <BrandIdentity linked={false}/>
    <h1 id="staff-sign-in-title">{denied ? 'Access unavailable' : 'CMS Portal'}</h1>
    <p className="cms-access-lede">{denied ? 'This account cannot open the CMS portal.' : local.enabled ? 'Choose your account to continue.' : STAFF_PORTAL_INTRO}</p>
    {denied ? <div className="cms-access-notice" role="alert"><p>{message}</p></div> : notices.length ? <div className="cms-access-warning" role="status">{notices.map(notice => <p key={notice}>{notice}</p>)}</div> : null}
    {!denied && local.enabled ? <form method="post" action={LOCAL_ADMIN_PATH}>
      <StaffReturnPath fallback={returnPath}/>
      <div className="cms-access-accounts" role="group" aria-label="Choose your account">{local.accounts.map(account => <button key={account.email} className="cms-access-account" type="submit" name="email" value={account.email} disabled={!local.ready}>
        <span className="cms-access-avatar" aria-hidden="true">{account.name.split(' ').map((word: string) => word[0]).join('')}</span>
        <span className="cms-access-account-name"><strong>{account.name}</strong><small>{account.email}</small></span>
        <span className="cms-access-account-arrow" aria-hidden="true">→</span>
      </button>)}</div>
      <ForgotPasswordHelp local/>
    </form> : null}
    {!denied && !local.enabled ? <>
      {signIn.href ? <StaffAccessLink href={signIn.href} requestUrl={requestUrl}>{STAFF_SIGN_IN_ACTION}</StaffAccessLink> : null}
      <ForgotPasswordHelp/>
      <a className="cms-access-help" href={STAFF_ACCESS_HELP_HREF}>{STAFF_ACCESS_HELP_LABEL}</a>
    </> : null}
    {denied ? local.enabled ? <form method="post" action={LOCAL_ADMIN_LOGOUT}><button className="cms-button cms-primary cms-access-action" type="submit">Switch account</button></form> : <a className="cms-button cms-primary cms-access-action" href={accessSignOutPath()} target="_top">Switch account</a> : null}
    <a className="cms-access-home" href="/">Return to the website</a>
  </section></main>;
}
