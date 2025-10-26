import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { addComment } from '../store/commentsActions';
import './CommentForm.css';

export default function CommentForm({ postId, parentId = null, onCreated }) {
  const dispatch = useDispatch();

  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e?.preventDefault?.();
    const content = text.trim();
    if (!content || busy) return;

    setBusy(true);
    setErr('');

    try {
      const res = await dispatch(addComment(postId, content, parentId));
      if (res?.ok) {
        setText('');
        onCreated?.(res.item);
      } else {
        const msg = String(res?.error?.message || res?.error || '');
        if (msg.includes('401')) {
          setErr('Please log in to comment.');
        } else {
          setErr(msg || 'Failed to create a comment.');
        }
      }
    } catch (e2) {
      const msg = String(e2?.message || '');
      if (msg.includes('401')) {
        setErr('Please log in to comment.');
      } else {
        setErr(msg || 'Failed to create a comment.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="cform" onSubmit={submit}>
      <textarea
        rows={3}
        placeholder={parentId ? 'Write a reply…' : 'Write a comment…'}
        value={text}
        onChange={(ev) => setText(ev.target.value)}
        disabled={busy}
      />
      <div className="cform_actions">
        {err && <div className="cform_err">⚠️ {err}</div>}
        <div style={{ flex: 1 }} />
        <button className="btn" type="submit" disabled={busy || text.trim() === ''}>
          {busy ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  );
}

CommentForm.propTypes = {
  postId: PropTypes.number.isRequired,
  parentId: PropTypes.number,
  onCreated: PropTypes.func,
};
