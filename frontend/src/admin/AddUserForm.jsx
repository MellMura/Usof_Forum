import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { createUserWithAvatarThunk } from '../store/profileActions';
import '../postForm/PostForm.css';

export default function AddUserForm({ open, onClose, onCreated }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    login: '',
    full_name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    status: 'user',
    rating: '0',
  });
  const [avatar, setAvatar] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const isRatingValid = useMemo(() => {
    if (form.rating === '' || form.rating === null || form.rating === undefined) return false;
    const n = Number(form.rating);
    return Number.isInteger(n);
  }, [form.rating]);

  const canSubmit = useMemo(() => {
    const { login, full_name, email, password, passwordConfirm } = form;
    return login && full_name && email && password && passwordConfirm && password === passwordConfirm && isRatingValid && !busy;
  }, [form, busy, isRatingValid]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!canSubmit) return;
    setBusy(true);

    try {
      const payload = { ...form, rating: parseInt(form.rating, 10) || 0 };
      const created = await dispatch(createUserWithAvatarThunk(payload, avatar));
      onCreated?.(created);
    } catch (e2) {
      setErr(e2?.message || 'Failed to create user');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="pform_backdrop" onMouseDown={onClose} role="presentation">
      <div className="pform" role="dialog" aria-modal="true" aria-labelledby="newuser-title" onMouseDown={(e)=>e.stopPropagation()}>
        <form className="pform_fields" onSubmit={submit}>
          <h3 id="newuser-title" className="pform_title">New User</h3>

          <label className="pform_field">
            <span className="pform_label">Avatar (optional)</span>
            <input
              className="pform_control"
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            />
          </label>

          <label className="pform_field">
            <span className="pform_label">Login</span>
            <input className="pform_control" value={form.login}
              onChange={(e)=>setForm(f=>({...f, login:e.target.value}))} required />
          </label>

          <label className="pform_field">
            <span className="pform_label">Full name</span>
            <input className="pform_control" value={form.full_name}
              onChange={(e)=>setForm(f=>({...f, full_name:e.target.value}))} required />
          </label>

          <label className="pform_field">
            <span className="pform_label">Email</span>
            <input type="email" className="pform_control" value={form.email}
              onChange={(e)=>setForm(f=>({...f, email:e.target.value}))} required />
          </label>

          <label className="pform_field">
            <span className="pform_label">Password</span>
            <input type="password" className="pform_control" value={form.password}
              onChange={(e)=>setForm(f=>({...f, password:e.target.value}))} required />
          </label>

          <label className="pform_field">
            <span className="pform_label">Confirm password</span>
            <input type="password" className="pform_control" value={form.passwordConfirm}
              onChange={(e)=>setForm(f=>({...f, passwordConfirm:e.target.value}))} required />
          </label>

          <label className="pform_field">
            <span className="pform_label">Status</span>
            <select className="pform_control" value={form.status}
              onChange={(e)=>setForm(f=>({...f, status:e.target.value}))}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>

          <label className="pform_field">
            <span className="pform_label">Rating</span>
            <input
              className="pform_control"
              type="number"
              step="1"
              value={form.rating}
              onChange={(e) => setForm(f => ({ ...f, rating: e.target.value }))}
            />
            {!isRatingValid && <small className="pform_error">Rating must be an integer.</small>}

          </label>

          {err && <div className="pform_error">{err}</div>}
          
          <div className="pform_actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="btn" disabled={!canSubmit}>{busy ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

AddUserForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onCreated: PropTypes.func,
};
