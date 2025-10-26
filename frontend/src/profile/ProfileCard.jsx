import React, { useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import UserLink from '../common/UserLink';
import Avatar from '../common/Avatar';
import Confirm from '../common/Confirm';
import './ProfileCard.css';

export default function ProfileCard({
  id, login, fullName, rating, status, /*elo = 0*/ picUrl, blocked = false, onBlock, onUnblock, canEdit = false, onEditClick,
  canChangeAvatar = false,
  canDeleteAvatar = false,
  onAvatarSelect,
  onDeleteAvatar,
  isAdmin = false,
  isMine = false,
  onDeleteUser
  }) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const [confirmDeleteAvatarOpen, setConfirmDeleteAvatarOpen] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);

  const [confirmDeleteUserOpen, setConfirmDeleteUserOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [blockedState, setBlockedState] = useState(blocked);
  useEffect(() => setBlockedState(blocked), [blocked]);
  
  const fileRef = useRef(null);
  const menuRef = useRef(null);

  const triggerUpload = () => fileRef.current?.click();
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) onAvatarSelect?.(f);
    e.target.value = '';
    setMenuOpen(false);
  };

  const doBlock = () => {
    if (isMine) return;    
    setConfirmBlockOpen(true);
    setMenuOpen(false);
  };

  const handleConfirmBlock = async () => {
    try {
      setBlocking(true);
      await onBlock?.(id);
      setBlockedState(true);
      setConfirmBlockOpen(false);
    } catch (err) {
      alert(err?.message || 'Failed to block user');
    } finally {
      setBlocking(false);
    }
  };

  const doUnblock = async () => {
    if (isMine) return;    
    await onUnblock?.(id);
    setBlockedState(false);
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen((s) => !s);

  const doEdit = () => {
    onEditClick?.(id);
    setMenuOpen(false);
  }

  const askDeleteAvatar = () => {
    setConfirmDeleteAvatarOpen(true);
    setMenuOpen(false);
  };

  const handleConfirmDeleteAvatar = async () => {
    try {
      setDeletingAvatar(true);
      await onDeleteAvatar?.(id);
      setConfirmDeleteAvatarOpen(false);
    } catch (err) {
      alert(err?.message || 'Failed to delete avatar');
    } finally {
      setDeletingAvatar(false);
    }
  };

  const askDeleteUser = () => {
    if (isMine) return;    
    setConfirmDeleteUserOpen(true);
    setMenuOpen(false);
  };

  const handleConfirmDeleteUser = async () => {
    try {
      setDeletingUser(true);
      await onDeleteUser?.(id);
      setConfirmDeleteUserOpen(false);
    } catch (err) {
      alert(err?.message || 'Failed to delete user');
    } finally {
      setDeletingUser(false);
    }
  };


  const handleCopyProfileLink = async (e) => {
    e?.stopPropagation?.();
    const url = `${window.location.origin}/profile?u=${id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert(`Copy this link:\n${url}`);
    } finally {
      setMenuOpen(false);
    }
  };
  
  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

return (
    <section className="profile_card">
      <div className="pc_left">
        <UserLink id={id} login={login} className="pc_avatarLink">
          <div className="pc_avatar">
            <Avatar src={picUrl} name={login} size={56} />
          </div>
        </UserLink>

        <div className="pc_meta">
          <UserLink id={id} login={login} className="pc_login">
            {login}
          </UserLink>
          <div className="pc_fullname">{fullName}</div>
          <div className="pc_stats">
            <span title="Rating">Rating: {rating ?? 0}</span>
            <span title="Status">Status: {status}</span>
          </div>
        </div>
      </div>

      <div className="pc_actions" ref={menuRef}>
        <button
          type="button"
          className="pc_kebab"
          aria-haspopup="menu"
          aria-expanded={menuOpen ? 'true' : 'false'}
          onClick={() => setMenuOpen((s) => !s)}
          title="More"
        >
          ⋮
        </button>

        {menuOpen && (
          <div className="pc_menu" role="menu">
            <button
              type="button"
              className="pc_menuItem"
              role="menuitem"
              onClick={handleCopyProfileLink}
              title="Copy profile link"
            >
              <i className="bx bx-link-alt" aria-hidden="true"></i>
              <span>{copied ? 'Copied!' : 'Copy link'}</span>
            </button>

            {canEdit && (
              <button type="button" className="pc_menuItem" onClick={doEdit} role="menuitem">
                <i className="bx bx-pencil" aria-hidden="true"></i>
                <span>Edit profile</span>
              </button>
            )}

            {canChangeAvatar && (
              <>
                <button type="button" className="pc_menuItem" onClick={triggerUpload} role="menuitem">
                  <i className="bx bx-image-add" aria-hidden="true"></i>
                  <span>Change avatar</span>
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFile}
                />
              </>
            )}

            {canDeleteAvatar && (
              <button type="button" className="pc_menuItem" onClick={askDeleteAvatar} role="menuitem">
                <i className="bx bx-trash" aria-hidden="true"></i>
                <span>Delete avatar</span>
              </button>
            )}

          {!isMine && (    
            !blockedState ? (
              <button type="button" className="pc_menuItem" onClick={doBlock} role="menuitem">
                <i className="bx bx-block" aria-hidden="true"></i>
                <span>Block user</span>
              </button>
            ) : (
              <button type="button" className="pc_menuItem" onClick={doUnblock} role="menuitem">
                <i className="bx bx-check-circle" aria-hidden="true"></i>
                <span>Unblock user</span>
              </button>
            )
          )}


            {!isMine && isAdmin && (
              <button
                type="button"
                className="pc_menuItem"
                onClick={askDeleteUser}
                role="menuitem"
                title="Delete user"
              >
                <i className="bx bx-trash" aria-hidden="true"></i>
                <span>Delete user</span>
              </button>
            )}
          </div>
        )}
      </div>

      <Confirm
        open={confirmBlockOpen}
        title="Block this user?"
        confirmText={blocking ? 'Blocking…' : 'Block user'}
        cancelText="Cancel"
        onConfirm={handleConfirmBlock}
        onCancel={() => setConfirmBlockOpen(false)}
      />

      <Confirm
        open={confirmDeleteAvatarOpen}
        title="Delete this user's avatar?"
        message={`This will permanently remove ${login}'s avatar.`}
        confirmText={deletingAvatar ? 'Deleting…' : 'Delete avatar'}
        cancelText="Cancel"
        onConfirm={handleConfirmDeleteAvatar}
        onCancel={() => setConfirmDeleteAvatarOpen(false)}
      />

      <Confirm
        open={confirmDeleteUserOpen}
        title="Delete this user?"
        message={`This will permanently vanish ${login} from existence.`}
        confirmText={deletingUser ? 'Deleting…' : 'Delete user'}
        confirmDisabled={deletingUser}
        cancelText="Cancel"
        onConfirm={handleConfirmDeleteUser}
        onCancel={() => setConfirmDeleteUserOpen(false)}
      />
    </section>
  );
}

ProfileCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  login: PropTypes.string.isRequired,
  fullName: PropTypes.string,
  rating: PropTypes.number,
  status: PropTypes.string,
  //elo: PropTypes.number,
  picUrl: PropTypes.string,
  blocked: PropTypes.bool,
  onBlock: PropTypes.func,
  onUnblock: PropTypes.func,
  canEdit: PropTypes.bool,
  onEditClick: PropTypes.func,
  canChangeAvatar: PropTypes.bool,
  canDeleteAvatar: PropTypes.bool,
  onAvatarSelect: PropTypes.func,
  onDeleteAvatar: PropTypes.func,
  isAdmin: PropTypes.bool,
  onDeleteUser: PropTypes.func,
  isMine: PropTypes.bool,  
};

ProfileCard.defaultProps = {
  fullName: '',
  rating: 0,
  status: 'user',
  elo: 0,
  picUrl: '',
  blocked: false,
  onBlock: undefined,
  onUnblock: undefined,
  canEdit: false,
  onEditClick: undefined,
  canChangeAvatar: false,
  canDeleteAvatar: false,
  onAvatarSelect: undefined,
  onDeleteAvatar: undefined,
  isAdmin: false,
  onDeleteUser: undefined,
  isMine: false,
};
