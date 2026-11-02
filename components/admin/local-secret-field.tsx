'use client';
import {useState} from 'react';
import {Eye, EyeOff} from 'lucide-react';

export function LocalSecretField() {
  const [shown, setShown] = useState(false);
  return <div className="cms-access-secret"><input id="local-secret" name="secret" type={shown ? 'text' : 'password'} autoComplete="current-password" required maxLength={200}/><button type="button" aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown} aria-controls="local-secret" onClick={() => setShown((value) => !value)}>{shown ? <EyeOff size={20} aria-hidden="true"/> : <Eye size={20} aria-hidden="true"/>}</button></div>;
}
