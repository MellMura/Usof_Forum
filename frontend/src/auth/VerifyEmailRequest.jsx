import React, { useState } from 'react';
import { req } from '../common/APIUtils';
import AuthLayout from './AuthLayout';
import './AuthTheme.css';

const VerifyEmailRequest = () => {
  const stored = localStorage.getItem('pendingEmail') || '';
  const [email, setEmail] = useState(stored);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const resend = async (e) => {
    e.preventDefault();
    setErr(''); setMsg(''); setBusy(true);
    try {
      const res = await req('/api/auth/verify-email/send', {
        method: 'POST',
        body: { email },
      });
      setMsg(res?.message || 'Verification link sent. Check your inbox.');
      localStorage.setItem('pendingEmail', email);
    } catch (e2) {
      setErr(e2.message || 'Could not send verification email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      below={<p className="auth_links">Already verified? <a href="/login">Go to login</a></p>}
    >
        <hr></hr>
      <form className="auth_form" onSubmit={resend}>
        <label className="au_field">
          <div className="au_labelrow">
            <span className="au_label">E-mail</span>
          </div>
          <input
            className="auth_input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder='youremail@gmail.com'
          />
        </label>

        {err ? <div className="auth_error">{err}</div> : null}
        {msg ? <div className="auth_ok">{msg}</div> : null}

        <button className="auth_btn auth_btn--light" type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Resend verification email'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default VerifyEmailRequest;
