import React, { useMemo, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Avatar from '../common/Avatar';
import UserLink from '../common/UserLink';
import Reaction from '../reaction';
import Badge from '../badge';
import Confirm from '../common/Confirm';
import EditCommentForm from './EditCommentForm';
import { useDispatch } from 'react-redux';
import { updateCommentThunk, deleteCommentThunk, toggleCommentLockThunk, toggleCommentLockAdminThunk, toggleCommentStatusAdminThunk } from '../store/commentsActions';

import './Comment.css';

export default function Comment({
  id,
  authorId,
  author,
  authorPicUrl,
  authorRating,
  userStatus,
  avatarUrl,
  createdAt,
  content,
  likes,
  dislikes,
  myReaction,
  onReplySubmit,
  fetchOnMount = true,
  currentUserId,
  postAuthorId,
  isAdmin = false,
  locked = 0,
  postActive = true,
  status = 'active',
  allowReply = false,
  disabledReason,
}) {
  const dispatch = useDispatch();
  
  const createdStr = useMemo(() => {
    const d = new Date(createdAt);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  }, [createdAt]);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!allowReply && replyOpen) setReplyOpen(false);
  }, [allowReply, replyOpen]);

  const submitReply = async () => {
    const text = replyText.trim();
    if (!text) return;
    setBusy(true);
    setErr('');
    try {
      await onReplySubmit?.(id, text);
      setReplyText('');
      setReplyOpen(false);
    } catch (e) {
      setErr(e?.message || 'Failed to reply');
    } finally {
      setBusy(false);
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmActiveOpen, setConfirmActiveOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lockedState, setLockedState] = useState(Number(locked) === 1);
  const [activeState, setActiveState] = useState(status === 'active');

  useEffect(() => { setLockedState(Number(locked) === 1); }, [locked]);
  useEffect(() => { setActiveState(status === 'active'); }, [status]);

  const menuRef = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const canEdit = Number(currentUserId) === Number(authorId);
  const canDelete = canEdit || Number(currentUserId) === Number(postAuthorId) || isAdmin;
  const canLock = canEdit || isAdmin;
  const canAdminToggleComment = isAdmin;

  const hasMenu = canEdit || canDelete || canLock || canAdminToggleComment;

  const handleToggleLock = async () => {
    if (!canLock) return;

    const next = lockedState ? 0 : 1;
    setLockedState(Boolean(next));
    try {
      const isOwner = Number(currentUserId) === Number(authorId);

      if (isAdmin && !isOwner) {
        await dispatch(toggleCommentLockAdminThunk(id, next));
      } else {
        await dispatch(toggleCommentLockThunk(id, next));
      }
      setMenuOpen(false);
    } catch (error) {
      setLockedState(!Boolean(next));
      alert(error || 'Failed to update comment lock state');
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await dispatch(deleteCommentThunk(id));
      setConfirmDeleteOpen(false);
      setMenuOpen(false);
    } catch (error) {
      alert(error || 'Failed to delete comment');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleCommentStatus = async () => {
    if (!isAdmin) return;

    const next = activeState ? 'inactive' : 'active';
    setActiveState(next === 'active');
    try {
      await dispatch(toggleCommentStatusAdminThunk(id, next));

      setConfirmActiveOpen(false);
      setMenuOpen(false);
    } catch (error) {
      setActiveState(!(next === 'active'));
      alert(error || 'Failed to update comment status');
    }
  };

  return (
    <article className="comment" role="article" aria-label={`Comment by ${author}`}>
      <header className="comment_head">
        <UserLink id={authorId} login={author} className="comment_user">
          <div className="comment_avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={`${author}'s avatar`} />
            ) : (
              <Avatar src={authorPicUrl} name={author} />
            )}
          </div>
          <div className="comment_meta">
            <strong className="comment_author">
              <span className="comment_status">{userStatus}</span>: {author}
            </strong>
            <span className="comment_date">{createdStr}</span>
          </div>
        </UserLink>

        <div className="comment_right">
          <span className="comment_badge_wrap" title={`Rating: ${authorRating ?? '–'}`}>
            <Badge rating={authorRating} />
          </span>

          <div className="comment_actions_more" ref={menuRef}>
            <button
              type="button"
              className={`comment_kebab ${hasMenu ? '' : 'is-disabled'}`}
              aria-expanded={hasMenu && menuOpen ? 'true' : 'false'}
              aria-disabled={hasMenu ? 'false' : 'true'}
              disabled={!hasMenu}
              onClick={hasMenu ? () => setMenuOpen((v) => !v) : undefined}
              title={hasMenu ? 'More' : ''}
            >
              ⋮
            </button>

            {hasMenu && menuOpen && (
              <div className="comment_menu" role="menu">
                 {canAdminToggleComment && (
                  <button
                    type="button"
                    className="comment_menuItem"
                    role="menuitem"
                    onClick={() => setConfirmActiveOpen(true)}
                  >
                    <i className={`bx ${activeState ? 'bx-toggle-left' : 'bx-toggle-right'}`} aria-hidden="true"></i>
                    <span>{activeState ? 'Set Inactive' : 'Set Active'}</span>
                  </button>
                )}

                {canLock && (
                  <button
                    type="button"
                    className="comment_menuItem"
                    role="menuitem"
                    onClick={handleToggleLock}
                    title={lockedState ? 'Unlock comment' : 'Lock comment'}
                  >
                    <i className={`bx ${lockedState ? 'bx-lock-open' : 'bx-lock'}`} aria-hidden="true"></i>
                    <span>{lockedState ? 'Unlock comment' : 'Lock comment'}</span>
                  </button>
                )}

                {canEdit && (
                  <button
                    type="button"
                    className="comment_menuItem"
                    role="menuitem"
                    onClick={() => { setEditOpen(true); setMenuOpen(false); }}
                  >
                    <i className="bx bx-pencil" aria-hidden="true"></i>
                    <span>Edit comment</span>
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    className="comment_menuItem"
                    role="menuitem"
                    onClick={() => setConfirmDeleteOpen(true)}
                    disabled={deleting}
                  >
                    <i className="bx bx-trash-alt" aria-hidden="true"></i>
                    <span>Delete comment</span>
                  </button>
                )}

               
                <Confirm
                  open={confirmDeleteOpen}
                  title="Delete this comment?"
                  confirmText={deleting ? 'Deleting…' : 'Delete'}
                  cancelText="Cancel"
                  onConfirm={handleDelete}
                  onCancel={() => setConfirmDeleteOpen(false)}
                  className="comment_confirm"
                />
                <Confirm
                  open={confirmActiveOpen}
                  title={activeState ? 'Set the comment inactive?' : 'Set the comment active?'}
                  confirmText={activeState ? 'Set inactive' : 'Set active'}
                  cancelText="Cancel"
                  onConfirm={handleToggleCommentStatus}
                  onCancel={() => setConfirmActiveOpen(false)}
                  className="comment_confirm"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="comment_body">{content}</div>

      <footer className="comment_actions" aria-label="comment actions">
        <Reaction
          kind="comment"
          id={id}
          initialLike={likes ?? 0}
          initialDislike={dislikes ?? 0}
          initialMy={myReaction ?? null}
          fetchOnMount={fetchOnMount}
        />

<button
          type="button"
          className="cbtn cbtn--icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!allowReply) return;
            setReplyOpen((v) => !v);
          }}
          title={allowReply ? 'Reply' : (disabledReason || 'Reply disabled')}
          aria-label="Reply"
          disabled={!allowReply}
          aria-disabled={!allowReply}
        >
          <i className="bx bx-reply" aria-hidden="true"></i>
        </button>
      </footer>

      {replyOpen && (
        <div className="comment_reply">
          <textarea
            rows={3}
            placeholder={
              allowReply ? 'Write a reply…' : (disabledReason || 'Commenting is disabled.')
            }
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={!allowReply}
            aria-disabled={!allowReply}
          />
          <div className="reply_actions">
            <button
              className="btn ghost"
              type="button"
              onClick={() => { setReplyOpen(false); setReplyText(''); }}
            >
              Cancel
            </button>
            <button
              className="btn"
              type="button"
              onClick={submitReply}
              disabled={!allowReply || busy || replyText.trim() === ''}
            >
              Send
            </button>
          </div>
          {err && <div className="comment_err">⚠️ {err}</div>}
        </div>
      )}
      <EditCommentForm
        open={editOpen}
        initialContent={content}
        onClose={() => setEditOpen(false)}
        onSubmit={async (newContent) => {
          await dispatch(updateCommentThunk(id, newContent));
        }}
      />
    </article>
  );
}

Comment.propTypes = {
  id: PropTypes.number.isRequired,
  authorId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  author: PropTypes.string.isRequired,
  authorRating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  userStatus: PropTypes.string,
  avatarUrl: PropTypes.string,
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  content: PropTypes.string.isRequired,
  likes: PropTypes.number,
  dislikes: PropTypes.number,
  myReaction: PropTypes.oneOf(['like', 'dislike', null]),
  onReplySubmit: PropTypes.func,
  fetchOnMount: PropTypes.bool,
  currentUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  postAuthorId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isAdmin: PropTypes.bool,
  locked: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  postActive: PropTypes.bool,
  allowReply: PropTypes.bool,
  disabledReason: PropTypes.string
};

Comment.defaultProps = {
  avatarUrl: '',
  authorId: undefined,
  authorRating: 0,
  userStatus: 'user',
  likes: 0,
  dislikes: 0,
  myReaction: null,
  onReplySubmit: undefined,
  fetchOnMount: true,
  currentUserId: undefined,
  postAuthorId: undefined,
  isAdmin: false,
  locked: 0,
  postActive: true,
  allowReply: false,
  disabledReason: undefined,
};
