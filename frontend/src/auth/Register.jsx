import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { req } from '../common/APIUtils';
import AuthLayout from './AuthLayout';
import './AuthTheme.css';

const Register = ({ onSuccess }) => {
  const [login, setLogin] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');

    const form = e.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (password !== passwordConfirm) {
      setErr('Passwords do not match.');
      return;
    }

    setBusy(true);
    
    try {
      await req('/api/auth/register', {
        method: 'POST',
        body: { login, full_name: fullName, email, password, passwordConfirm },
      });

      setOk('Registered successfully!');
      localStorage.setItem('pendingEmail', email);
      onSuccess?.();
      window.location.href = '/verify-email';
    } catch (e2) {
      setErr(e2.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout
      title="Registration"
      below={
        <p className="auth_links">
          Want to go back to log in?{' '}
          <a href="/login">Click here</a>
        </p>
      }
    >
        <hr></hr>
      <form className="auth_form" onSubmit={submit}>
  <label className="au_field">
    <div className="au_labelrow">
      <span className="au_label">Login</span>
    </div>
    <input
      className="auth_input"
      type="text"
      value={login}
      onChange={(e) => setLogin(e.target.value)}
      required
    />
  </label>

  <label className="au_field">
    <div className="au_labelrow">
      <span className="au_label">Full Name</span>
    </div>
    <input
      className="auth_input"
      type="text"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      required
    />
  </label>

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
      placeholder='youremail@example.com'
    />
  </label>

  <label className="au_field">
    <div className="au_labelrow">
      <span className="au_label">Password</span>
    </div>
    <input
      className="auth_input"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_\-\*])[A-Za-z0-9_\-\*]{8,}$"
      title="At least 8 chars, with uppercase, lowercase, a number, and one of _ - *"
    />
  </label>

  <label className="au_field">
    <div className="au_labelrow">
      <span className="au_label">Confirm Password</span>
    </div>
    <input
      className="auth_input"
      type="password"
      value={passwordConfirm}
      onChange={(e) => setPasswordConfirm(e.target.value)}
      required
    />
  </label>

  {(password && passwordConfirm && password !== passwordConfirm) &&
    <div className="auth_error">Passwords do not match.</div>}

  {err && <div className="auth_error">{err}</div>}
  {ok && <div className="auth_ok">{ok}</div>}

  <button className="auth_btn auth_btn--light" type="submit" disabled={busy}>
    {busy ? 'Registering…' : 'Register'}
  </button>
</form>
    </AuthLayout>
  );
};

Register.propTypes = { onSuccess: PropTypes.func };
Register.defaultProps = { onSuccess: undefined };

export default Register;