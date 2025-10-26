import React, { useEffect, useState } from 'react';
import AuthLayout from './AuthLayout';
import './AuthTheme.css';

export default function VerifyEmailConfirm() {
  const status = new URL(window.location.href).searchParams.get('status');

  return (
    <AuthLayout title="Email verification" below={<p className="auth_links">Go to <a href="/login">Log in</a></p>}>
      <hr />
      {status === 'ok'    && <div className="auth_ok">Email verified! You can log in now.</div>}
      {status === 'error' && <div className="auth_error">Verification failed or link expired.</div>}
      {!status && <div className="auth_ok">Verifying…</div>}
    </AuthLayout>
  );
}