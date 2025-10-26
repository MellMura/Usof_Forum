import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import './PostForm.css';
import { useDispatch, useSelector } from 'react-redux';
import { loadCategories } from '../store/categoriesActions';
import { createPostThunk } from '../store/postsActions';

function CategoryPicker({ all, value, onChange }) {
  const selected = useMemo(() => new Set(value), [value]);

  const toggle = (name) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    onChange(Array.from(next));
  };

  return (
    <div className="catpicker">
      {all.map((c) => {
        const name = c.name ?? c.title ?? String(c.id);
        const isOn = selected.has(name);
        return (
          <button
            key={name}
            type="button"
            className={`catpill ${isOn ? 'catpill--on' : ''}`}
            onClick={() => toggle(name)}
            aria-pressed={isOn ? 'true' : 'false'}
            title={name}
          >
            <span className="catpill_check" aria-hidden="true">
              {isOn ? '☑' : '☐'}
            </span>
            <span className="catpill_text">{name}</span>
          </button>
        );
      })}
    </div>
  );
}

CategoryPicker.propTypes = {
  all: PropTypes.array.isRequired,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

const AddPostForm = ({ open, onClose, onCreated }) => {
  const dispatch = useDispatch();

  //all categories in the DB
  const cats = useSelector((s) => s.categories.items || []);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [pick, setPick] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    dispatch(loadCategories()).catch(() => {});     
  }, [open, dispatch]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!title.trim() || !content.trim()) {
      setErr('Title and content are required.');
      return;
    }
    setBusy(true);
    try {
      const categories = Array.from(pick);
      const created = await dispatch(
        createPostThunk({ title: title.trim(), content: content.trim(), categories })
      );

      setTitle('');
      setContent('');
      setPick(new Set());
      onCreated?.(created?.id ? created : undefined);
    } catch (e2) {
      console.error(e2);
      setErr(e2?.message || 'Failed to create post. You need to log in first');
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0 && !busy,
    [title, content, busy],
  );

  if (!open) return null;

  const overlay = (
    <div className="pform_backdrop" onMouseDown={onClose} role="presentation">
      <div
        className="pform"
        role="dialog"
        aria-modal="true"
        aria-labelledby="newpost-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <form className="pform_fields" onSubmit={submit}>
          <h3 id="newpost-title" className="pform_title">New Post</h3>

          <label className="pform_field">
            <span className="pform_label">Title</span>
            <input
              className="pform_control"
              type="text"
              maxLength={140}
              placeholder="e.g., I keep blundering my knight in the Sicilian"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="pform_field">
            <span className="pform_label">Content</span>
            <textarea
              className="pform_control pform_textarea"
              rows={6}
              placeholder="Describe the situation…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </label>

          <label className="pform_field">
            <span className="pform_label">Categories</span>
            <CategoryPicker all={cats} value={pick} onChange={setPick} />
            <small className="pform_help">Click to select or deselect.</small>
          </label>

          {err ? <div className="pform_error">{err}</div> : null}

          <div className="pform_actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={!canSubmit}>
              {busy ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  
  return ReactDOM.createPortal(overlay, document.body);
};

AddPostForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onCreated: PropTypes.func,
};
  
AddPostForm.defaultProps = {
  onClose: undefined,
  onCreated: undefined,
};
  
export default AddPostForm;