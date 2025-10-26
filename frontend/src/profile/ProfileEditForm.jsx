import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import '../postForm/PostForm.css';

import { updateProfileThunk } from '../store/profileActions';

export default function ProfileEditForm({ open, onClose, user, isAdmin }) {
  const dispatch = useDispatch();
  const updating = useSelector((s) => s.profile?.updating);
  const updateError = useSelector((s) => s.profile?.updateError);

  const [login, setLogin] = useState(user?.login || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [rating, setRating] = useState(user?.rating ?? 0);
  const [status, setStatus] = useState(user?.status || 'user');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setLogin(user?.login || '');
    setFullName(user?.full_name || '');
    setEmail(user?.email || '');
    setRating(user?.rating ?? 0);
    setStatus(user?.status || 'user');
    setErr('');
  }, [open, user]);

  const canSubmit = useMemo(() => {
    const okLogin = login.trim().length > 0;
    const okFull  = fullName.trim().length > 0;
    const okEmail = email.trim().length > 0;
  
    const okAdmin = !isAdmin || Number.isFinite(Number(rating));
  
    return okLogin && okFull && okEmail && okAdmin && !busy && !updating;
  }, [login, fullName, email, isAdmin, rating, busy, updating]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!login.trim() || !fullName.trim() || !email.trim()) {
      setErr('Login, full name and email are required.');
      return;
    }
    setBusy(true);
    try {
      const formData = {
        login: login.trim(),
        full_name: fullName.trim(),
        email: email.trim(),
        ...(isAdmin ? { rating: Number(rating) || 0, status } : {}),
      };
      await dispatch(updateProfileThunk({ userId: user.id, formData, isAdmin }));
      onClose?.();
    } catch (e2) {
      setErr(e2?.message || 'Failed to update profile');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  const overlay = (
    <div
      className="pform_backdrop"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className="pform"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editprofile-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <form className="pform_fields" onSubmit={submit}>
          <h3 id="editprofile-title" className="pform_title">Edit Profile</h3>

          <label className="pform_field">
            <span className="pform_label">Login</span>
            <input
              className="pform_control"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </label>

          <label className="pform_field">
            <span className="pform_label">Full name</span>
            <input
              className="pform_control"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>

          <label className="pform_field">
            <span className="pform_label">Email</span>
            <input
              className="pform_control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {isAdmin && (
            <>
              <label className="pform_field">
                <span className="pform_label">Rating</span>
                <input
                  className="pform_control"
                  type="number"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </label>

              <label className="pform_field">
                <span className="pform_label">Status</span>
                <select
                  className="pform_control pform_select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <small className="pform_help">Only admins can change this.</small>
              </label>
            </>
          )}

          {err ? <div className="pform_error">{err}</div> : null}
          {updateError ? <div className="pform_error">{updateError}</div> : null}

          <div className="pform_actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy || updating}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={!canSubmit}>
              {(busy || updating) ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
}

ProfileEditForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  user: PropTypes.object,
  isAdmin: PropTypes.bool,
};

ProfileEditForm.defaultProps = {
  onClose: undefined,
  user: null,
  isAdmin: false,
};