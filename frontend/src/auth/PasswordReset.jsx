import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { req } from '../common/APIUtils';
import AuthLayout from './AuthLayout';
import './AuthTheme.css';

const getResetTokenFromUrl = () => {
  const url = new URL(window.location.href);
  const q = url.searchParams.get('token') || url.searchParams.get('confirm_token');
  if (q) return q.trim();
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] === 'remind' && parts[1] === 'confirm' && parts[2]) return parts[2].trim();
  if (parts[0] === 'password-reset' && parts[1]) return parts[1].trim();
  return '';
};

const PasswordReset = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(getResetTokenFromUrl());
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const requestReset = async (e) => {
    e.preventDefault();
    setErr(''); setMsg(''); setBusy(true);
    try {
      const data = await req('/api/auth/password-reset', {
        method: 'POST',
        body: { email },
      });
      setMsg(data?.message || 'Reset link sent. Check your email.');
    } catch (e2) {
      console.error(e2);
      setErr(e2.message || 'Failed to send reset link.');
    } finally {
      setBusy(false);
    }
  };

  const confirmReset = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    if (password !== passwordConfirm) {
      setErr('Passwords do not match.');
      return;
    }
    if (!token) {
      setErr('Reset link is missing or invalid. Please request a new one.');
      return;
    }
    setBusy(true);
    try {
      await req(`/api/auth/password-reset/${encodeURIComponent(token)}`, {
        method: 'POST',
        body: { password, passwordConfirm },
      });
      setMsg('Password changed! You can log in now.');
    } catch (e2) {
      console.error(e2);
      setErr(e2.message || 'Failed to change password. Your link might be invalid or expired.');
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'confirm') {
    const hasToken = Boolean(token);

    return (
      <AuthLayout
        title="Set a new password"
        below={<p className="auth_links">Back to <a href="/login">Log in</a></p>}
      >
        <hr></hr>
        <form className="auth_form" onSubmit={confirmReset}>
          {!hasToken && (
            <div className="auth_error" style={{ marginBottom: 8 }}>
              Your reset link is missing or invalid. Please request a new one on the reminder page.
            </div>
          )}

          <label className="au_field">
            <div className="au_labelrow">
              <span className="au_label">New password</span>
            </div>
            <input
              className="auth_input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_\-\*])[A-Za-z0-9_\-\*]{8,}$"
              title="At least 8 characters, with uppercase, lowercase, and a number."
            />
          </label>

          <label className="au_field">
            <div className="au_labelrow">
              <span className="au_label">Confirm new password</span>
            </div>
            <input
              className="auth_input"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </label>

          {password && passwordConfirm && password !== passwordConfirm && (
            <div className="auth_error">Passwords do not match.</div>
          )}

          {err ? <div className="auth_error">{err}</div> : null}
          {msg ? <div className="auth_ok">{msg}</div> : null}

          <button className="auth_btn auth_btn--light" type="submit" disabled={busy || !hasToken}>
            {busy ? 'Saving…' : 'Change password'}
          </button>
        </form>

        {!hasToken && (
          <p className="auth_links" style={{ marginTop: 12 }}>
            Go to <a href="/remind">Password reminder</a>
          </p>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Password reset"
      below={<p className="auth_links">All set now? <a href="/login">Go to log in</a></p>}
    >
      <hr></hr>
      <form className="auth_form" onSubmit={requestReset}>
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
          {busy ? 'Sending…' : 'Send reminder'}
        </button>
      </form>
    </AuthLayout>
  );
};

PasswordReset.propTypes = { mode: PropTypes.oneOf(['request', 'confirm']) };
PasswordReset.defaultProps = { mode: 'request' };

export default PasswordReset;
