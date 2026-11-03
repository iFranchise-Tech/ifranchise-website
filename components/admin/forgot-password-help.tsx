'use client';

import {useState} from 'react';
import {LOCAL_DEV_ACCESS_HELP, LOCAL_DEV_HELP_LABEL, STAFF_PASSWORD_HELP} from '../../lib/local-admin.mjs';

export function ForgotPasswordHelp({local=false}:{local?:boolean}) {
  const [open, setOpen] = useState(false);
  return <div className="cms-access-forgot">
    <button type="button" className="cms-access-forgot-link" aria-expanded={open} aria-controls="local-password-help" onClick={() => setOpen((value) => !value)}>{local ? LOCAL_DEV_HELP_LABEL : 'Forgot password?'}</button>
    {open ? <p id="local-password-help" className="cms-access-forgot-help" role="note">{local?LOCAL_DEV_ACCESS_HELP:STAFF_PASSWORD_HELP}{!local&&<> <a href="/cms/access-help">Email me access guidance</a></>}</p> : null}
  </div>;
}
