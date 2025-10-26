import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import '../postForm/PostForm.css';

export default function EditCommentForm({
  open,
  initialContent = '',
  onClose,
  onSubmit,
  title = 'Edit comment',
}) {
  const [content, setContent] = useState(initialContent);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const areaRef = useRef(null);

  useEffect(() => { if (open) setContent(initialContent); }, [open, initialContent]);

  const trimmed = useMemo(() => content.trim(), [content]);
  const disabled = !trimmed || busy;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (disabled) return;
    setErr(''); setBusy(true);
    try {
      await onSubmit?.(trimmed);
      onClose?.();
    } catch (ex) {
      setErr(ex?.message || 'Failed to save');
    } finally { setBusy(false); }
  };

  if (!open) return null;

  const modal = (
    <div className="pform_backdrop" onMouseDown={onClose} role="presentation">
      <div className="pform" role="dialog" aria-modal="true" aria-labelledby="edit-comment-title"
           onMouseDown={(e) => e.stopPropagation()}>
        <form className="pform_fields" onSubmit={handleSubmit}>
          <h3 id="edit-comment-title" className="pform_title">{title}</h3>

          <label className="pform_field">
            <span className="pform_label">Content</span>
            <textarea
              ref={areaRef}
              className="pform_control pform_textarea"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Update your comment…"
              required
            />
          </label>

          {err && <div className="pform_error">⚠️ {err}</div>}

          <div className="pform_actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={disabled}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

EditCommentForm.propTypes = {
  open: PropTypes.bool.isRequired,
  initialContent: PropTypes.string,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};
