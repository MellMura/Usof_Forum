import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import '../postForm/PostForm.css';

export default function EditCategoryForm({ open, onClose, category, onSave }) {
  const isEdit = useMemo(() => !!(category && category.id != null), [category]);

  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(category?.name || '');
    setDescription(category?.description || '');
    setErr('');
  }, [open, category?.name, category?.description]);

  const canSubmit = useMemo(() => {
    if (busy) return false;
    return name.trim().length > 0;
  }, [name, busy]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName) {
      setErr('Name is required.');
      return;
    }

    setBusy(true);
    try {
      await onSave?.({
        id: category?.id,
        name: trimmedName,
        description: trimmedDesc,
      });
      onClose?.();
    } catch (e2) {
      setErr(e2?.message || 'Failed to save category.');
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
        aria-labelledby="editcategory-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <form className="pform_fields" onSubmit={submit}>
          <h3 id="editcategory-title" className="pform_title">
            {isEdit ? 'Edit Category' : 'Create Category'}
          </h3>

          <label className="pform_field">
            <span className="pform_label">Name</span>
            <input
              className="pform_control"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="e.g. Announcements"
              required
            />
          </label>

          <label className="pform_field">
            <span className="pform_label">Description</span>
            <textarea
              className="pform_control pform_textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              placeholder="Short description…"
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
              {busy ? 'Saving…' : (isEdit ? 'Save changes' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
}

EditCategoryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  category: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
};

EditCategoryForm.defaultProps = {
  onClose: undefined,
  category: null,
};
