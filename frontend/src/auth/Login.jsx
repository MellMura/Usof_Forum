import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AuthLayout from './AuthLayout';
import './AuthTheme.css';
import { req, setToken } from '../common/APIUtils';

const Login = ({ onSuccess }) => {
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);

    try {
      
      const data = await req('/api/auth/login', { method:'POST', body:{ login, email, password } });
      if (data?.accessToken) setToken(data.accessToken);
      onSuccess?.();
    } catch (e2) {
      console.error(e2);
      setErr('Login failed. Make sure your email is verified and that your credentials are correct.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      below={
        <>
          <p className="auth_links">
            Don&apos;t have an account? <a href="/register">Register here</a>
          </p>
          <p className="auth_links">
            Forgot your password? <a href="/remind">Click here</a>
          </p>
        </>
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
          />
        </label>

        {err ? <div className="auth_error">{err}</div> : null}

        <button className="auth_btn auth_btn--light" type="submit" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
};

Login.propTypes = { onSuccess: PropTypes.func };
Login.defaultProps = { onSuccess: undefined };

export default Login;
