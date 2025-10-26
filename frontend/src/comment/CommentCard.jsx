import React, { useMemo, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import Avatar from '../common/Avatar';
import UserLink from '../common/UserLink';
import Badge from '../badge';
import Reaction from '../reaction';
import Confirm from '../common/Confirm';

import {
  updateCommentThunk,
  deleteCommentThunk,
  toggleCommentLockThunk,
  toggleCommentLockAdminThunk,
  toggleCommentStatusAdminThunk,
} from '../store/commentsActions';

import './CommentCard.css';

export default function CommentCard({
  id,
  authorId,
  onDeleted,
  author,
  authorPicUrl,
  avatarUrl,
  userStatus = 'user',
  authorRating = 0,
  createdAt,
  content,
  likes = 0,
  dislikes = 0,
  myReaction = null,
  fetchOnMount = true,
  currentUserId,
  postAuthorId,
  isAdmin = false,
  locked = 0,
  status = 'active',
}) {
  const dispatch = useDispatch();

  const createdStr = useMemo(() => {
    const d = new Date(createdAt);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  }, [createdAt]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmActiveOpen, setConfirmActiveOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lockedState, setLockedState] = useState(Number(locked) === 1);
  const [activeState, setActiveState] = useState(status === 'active');

  useEffect(() => { setLockedState(Number(locked) === 1); }, [locked]);
  useEffect(() => { setActiveState(status === 'active'); }, [status]);

  const canEdit = Number(currentUserId) === Number(authorId);
  const canDelete = canEdit || Number(currentUserId) === Number(postAuthorId) || isAdmin;
  const canLock = canEdit || isAdmin;
  const canAdminToggleComment = isAdmin;

  const menuRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

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
    } catch (e) {
      setLockedState(!Boolean(next));
      alert(e?.message || 'Failed to update comment lock');
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await dispatch(deleteCommentThunk(id));
      setConfirmDeleteOpen(false);
      setMenuOpen(false);
      onDeleted?.(id);
    } catch (e) {
      alert(e?.message || 'Failed to delete comment');
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
    } catch (e) {
      setActiveState(!(next === 'active'));
      alert(e?.message || 'Failed to update comment status');
    }
  };

  return (
    <section id={`cc-${id}`} className="cc" aria-label={`Comment by ${author}`}>
      <div className="cc_left">
        <div className="cc_avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${author}'s avatar`} />
          ) : (
            <Avatar src={authorPicUrl} name={author} size={36} />
          )}
        </div>

        <div className="cc_meta">
          <UserLink id={authorId} login={author} className="cc_userlink">
            <div className="cc_name">
              <span className="cc_status">{userStatus}</span>: {author}
            </div>
          </UserLink>
          <div className="cc_sub">
            <span className="cc_date">{createdStr}</span>
          </div>
        </div>
      </div>

      <div className="cc_actions" ref={menuRef}>
        <span className="cc_rating" title={`Rating: ${authorRating ?? '–'}`}>
          <Badge rating={authorRating} />
        </span>
        
        <button
          id={`cc-kebab-${id}`}
          type="button"
          className="cc_kebab"
          aria-haspopup="menu"
          aria-expanded={menuOpen ? 'true' : 'false'}
          onClick={() => setMenuOpen(v => !v)}
          title="More"
        >
          ⋮
        </button>

        {menuOpen && (
          <div
            id={`cc-menu-${id}`}
            className="cc_menu"
            role="menu"
            aria-labelledby={`cc-kebab-${id}`}
          >
            {canAdminToggleComment && (
              <button
                type="button"
                className="cc_menuItem"
                role="menuitem"
                onClick={() => setConfirmActiveOpen(true)}
                title={activeState ? 'Set Inactive' : 'Set Active'}
              >
                <i className={`bx ${activeState ? 'bx-toggle-left' : 'bx-toggle-right'}`} aria-hidden="true"></i>
                <span>{activeState ? 'Set Inactive' : 'Set Active'}</span>
              </button>
            )}

            {canLock && (
              <button
                type="button"
                className="cc_menuItem"
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
                className="cc_menuItem"
                role="menuitem"
                onClick={() => { setMenuOpen(false); setEditOpen(true); }}
              >
                <i className="bx bx-pencil" aria-hidden="true"></i>
                <span>Edit comment</span>
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                className="cc_menuItem"
                role="menuitem"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={deleting}
              >
                <i className="bx bx-trash-alt" aria-hidden="true"></i>
                <span>Delete comment</span>
              </button>
            )}

            {/* Confirms */}
            <Confirm
              open={confirmDeleteOpen}
              title="Delete this comment?"
              confirmText={deleting ? 'Deleting…' : 'Delete'}
              cancelText="Cancel"
              onConfirm={handleDelete}
              onCancel={() => setConfirmDeleteOpen(false)}
            />
            <Confirm
              open={confirmActiveOpen}
              title={activeState ? 'Set the comment inactive?' : 'Set the comment active?'}
              confirmText={activeState ? 'Set inactive' : 'Set active'}
              cancelText="Cancel"
              onConfirm={handleToggleCommentStatus}
              onCancel={() => setConfirmActiveOpen(false)}
            />
          </div>
        )}
      </div>

      <div className="cc_body">{content}</div>

      <div className="cc_footer" aria-label="comment actions">
        <Reaction
          kind="comment"
          id={id}
          initialLike={likes ?? 0}
          initialDislike={dislikes ?? 0}
          initialMy={myReaction ?? null}
          fetchOnMount={fetchOnMount}
        />
      </div>

      {editOpen && (
        <Confirm
          open={editOpen}
          title="Edit comment"
          confirmText="Save"
          cancelText="Cancel"
          onConfirm={async () => {
            const next = prompt('New content:', content);
            if (next != null && next.trim() !== '' && next !== content) {
              await dispatch(updateCommentThunk(id, next.trim()));
            }
            setEditOpen(false);
          }}
          onCancel={() => setEditOpen(false)}
        />
      )}
    </section>
  );
}

CommentCard.propTypes = {
  id: PropTypes.number.isRequired,
  onDeleted: PropTypes.func,
  authorId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  author: PropTypes.string.isRequired,
  authorPicUrl: PropTypes.string,
  avatarUrl: PropTypes.string,
  userStatus: PropTypes.string,
  authorRating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  content: PropTypes.string.isRequired,
  likes: PropTypes.number,
  dislikes: PropTypes.number,
  myReaction: PropTypes.oneOf(['like', 'dislike', null]),
  fetchOnMount: PropTypes.bool,
  currentUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  postAuthorId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isAdmin: PropTypes.bool,
  locked: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  status: PropTypes.oneOf(['active', 'inactive']),
};
