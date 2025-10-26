import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { loadCategories } from '../store/categoriesActions';
import { updatePostThunk, refetchPosts, fetchPostById } from '../store/postsActions';
import { updatePostAdmin } from '../post/PostAPI';

import './PostForm.css';
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
            <span className="catpill_check" aria-hidden="true">{isOn ? '☑' : '☐'}</span>
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

const EditPostForm = ({
  open,
  postId,
  initialTitle,
  initialContent,
  initialCategories,
  currentUserId,
  authorId,
  isAdmin,
  onClose,
  onUpdated,
}) => {
  const dispatch = useDispatch();
  const isOwner = Number(currentUserId) === Number(authorId);
  const canEditTitleContent = isOwner;
  const canEditCategories   = isOwner || isAdmin;

  //all categories from the db
  const cats = useSelector((s) => s.categories?.items ?? []);

  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [pick, setPick] = useState(initialCategories || []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    dispatch(loadCategories()).catch(() => {});
  }, [open, dispatch]);

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle || '');
    setContent(initialContent || '');
    setPick(initialCategories || []);
    setErr('');
  }, [open, initialTitle, initialContent, initialCategories]);

  const canSubmit = useMemo(() => {
    if (busy) return false;
    if (canEditTitleContent) {
      return title.trim().length > 0 && content.trim().length > 0;
    }
    return canEditCategories;
  }, [busy, canEditTitleContent, canEditCategories, title, content]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    setBusy(true);
    try {
      if (isOwner) {
        await dispatch(
          updatePostThunk(postId, {
            title: title.trim(),
            content: content.trim(),
            categories: pick,
          })
        );
      } else if (isAdmin && !isOwner) {
        await updatePostAdmin(postId, { categories: Array.isArray(pick) ? pick.join(',') : '' });
        await dispatch(refetchPosts('feed'));
        await dispatch(fetchPostById(postId));
      } else {
        throw new Error('You do not have permission to edit this post.');
      }

      onUpdated?.({ id: postId, title: title.trim(), content: content.trim(), categories: [...pick] });
      onClose?.();
    } catch (e2) {
      console.error(e2);
      setErr(e2?.message || 'Failed to update post.');
    } finally {
      setBusy(false);
    }
  };


  if (!open) return null;

  const overlay = (
    <div className="pform_backdrop" onMouseDown={onClose} role="presentation">
      <div
        className="pform"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editpost-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <form className="pform_fields" onSubmit={submit}>
          <h3 id="editpost-title" className="pform_title">Edit Post</h3>

          {canEditTitleContent && (
            <>
              <label className="pform_field">
                <span className="pform_label">Title</span>
                <input
                  className="pform_control"
                  type="text"
                  maxLength={140}
                  placeholder="Post title"
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
                  placeholder="Post content…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </label>
            </>
          )}

          {canEditCategories && (
            <label className="pform_field">
              <span className="pform_label">Categories</span>
              <CategoryPicker all={cats} value={pick} onChange={setPick} />
              <small className="pform_help">Click to select or deselect.</small>
            </label>
          )}

          {err ? <div className="pform_error">{err}</div> : null}

          <div className="pform_actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={!canSubmit}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
};

EditPostForm.propTypes = {
  open: PropTypes.bool.isRequired,
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initialTitle: PropTypes.string,
  initialContent: PropTypes.string,
  initialCategories: PropTypes.arrayOf(PropTypes.string),
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isAdmin: PropTypes.bool,
  onClose: PropTypes.func,
  onUpdated: PropTypes.func,
};

EditPostForm.defaultProps = {
  initialTitle: '',
  initialContent: '',
  initialCategories: [],
  currentUserId: undefined,
  authorId: undefined,
  isAdmin: false,
  onClose: undefined,
  onUpdated: undefined,
};

export default EditPostForm;
