import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { createCategoryThunk } from '../store/categoriesActions';
import '../postForm/PostForm.css';

export default function AddCategoryForm({ open, onClose, onCreated }) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [description, setDesc] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const canSubmit = useMemo(
    () => name.trim().length > 0 && description.trim().length > 0 && !busy,
    [name, description, busy]
  );

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!canSubmit) return;

    setBusy(true);
    try {
      const created = await dispatch(
        createCategoryThunk({ name: name.trim(), description: description.trim() })
      );
      setName('');
      setDesc('');
      onCreated?.(created);
    } catch (e2) {
      setErr(e2?.message || 'Failed to create category');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="pform_backdrop" onMouseDown={onClose} role="presentation">
      <div
        className="pform"
        role="dialog"
        aria-modal="true"
        aria-labelledby="newcat-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <form className="pform_fields" onSubmit={submit}>
          <h3 id="newcat-title" className="pform_title">New Category</h3>

          <label className="pform_field">
            <span className="pform_label">Name</span>
            <input
              className="pform_control"
              type="text"
              maxLength={60}
              placeholder="e.g., Openings"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="pform_field">
            <span className="pform_label">Description</span>
            <textarea
              className="pform_control pform_textarea"
              rows={4}
              placeholder="A short description of this category…"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              required
            />
          </label>

          {err ? <div className="pform_error">{err}</div> : null}

          <div className="pform_actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button type="submit" className="btn" disabled={!canSubmit}>
              {busy ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

AddCategoryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onCreated: PropTypes.func,
};
