import React, { useMemo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import UserLink from '../common/UserLink';
import Avatar from '../common/Avatar';
import Reaction from '../reaction';
import Bookmark from '../bookmark';
import Badge from '../badge';
import Confirm from '../common/Confirm';
import './Post.css';
import EditPostForm from '../postForm/EditPostForm';
import { deletePostThunk, toggleLockThunk, toggleLockAdminThunk, toggleStatusThunk, refetchPosts } from '../store/postsActions';
import { useDispatch } from 'react-redux';

const Post = ({
  id,
  currentUserId,
  isAdmin = false,
  authorId,
  author,
  authorPicUrl,
  authorRating,
  authorStatus,
  title,
  content,
  createdAt,
  likes,
  dislikes,
  myReaction,
  comments,
  bookmarked,
  categories,
  locked,
  status = 'active',
  reactionFetchOnMount = true,
  reactionMineOnlyOnMount = false,
}) => {
  const [copied, setCopied] = useState(false);
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((s) => !s);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [lockedState, setLockedState] = useState(Number(locked) === 1);
  const [activeState, setActiveState] = useState(status === 'active');

  useEffect(() => { setLockedState(Number(locked) === 1); }, [locked]);
  useEffect(() => { setActiveState(status === 'active'); }, [status]);

  const menuRef = useRef(null);

  const createdStr = useMemo(() => {
    const d = new Date(createdAt);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  }, [createdAt]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleToggleLock = async (e) => {
    e?.stopPropagation?.();
    const next = lockedState ? 0 : 1;
    setLockedState(Boolean(next));
    try {
      const isOwner = Number(currentUserId) === Number(authorId);
        if (isAdmin && !isOwner) {
          await dispatch(toggleLockAdminThunk(id, next));
        } else {
          await dispatch(toggleLockThunk(id, next));
        }
      setMenuOpen(false);
    } catch (err) {
      setLockedState(!Boolean(next));
      alert(err || 'Failed to update lock state');
    }
  };

  const handleToggleStatus = async (e) => {
    e?.stopPropagation?.();
    const nextStatus = activeState ? 'inactive' : 'active';
    setActiveState(nextStatus === 'active');
    try {
      await dispatch(toggleStatusThunk(id, nextStatus));
      setMenuOpen(false);
    } catch (err) {
      setActiveState(! (nextStatus === 'active'));
      alert(err || 'Failed to update post status');
    }
  };
  
  const handleConfirmDelete = async (e) => {
    e?.stopPropagation?.();
    try {
      setDeleting(true);
      await dispatch(deletePostThunk(id));
      setConfirmOpen(false);
      setMenuOpen(false);
    } catch (err) {
      alert(err || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const handleShareClick = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();

    const shareUrl = `http://localhost:4000/post/${id}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = shareUrl;
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
      alert(`Copy this link:\n${shareUrl}`);
    }
  };

  const canManage = isAdmin || Number(currentUserId) === Number(authorId);
  return (
    <article className={`post ${menuOpen ? 'menu-open' : ''}`} role="article" aria-label={title}>
      <a
        className="post_cardLink"
        href={`/post/${id}`}
        aria-label={`Open post: ${title}`}
        title={title}
      />

      <header className="post_top">
        <UserLink id={authorId} login={author} className="post_author_wrap post_interactive">
          <Avatar src={authorPicUrl} name={author} size={40}/>
        </UserLink>
        <div className="post_meta">
          <div className="post_toprow">
          <UserLink id={authorId} login={author} className="post_author post_interactive">
            <strong>{`${authorStatus}: ${author}`}</strong>
          </UserLink>
          <Badge rating={authorRating} className="post_interactive" title={`Rating: ${authorRating ?? 0}`} />
            <div className="post_actions post_interactive" ref={menuRef}>
            <button
              type="button"
              className="post_kebab post_interactive"
              aria-haspopup="menu"
              aria-expanded={menuOpen ? 'true' : 'false'}
              onClick={toggleMenu}
              title="More"
            >
              ⋮
            </button>

            {menuOpen && (
                <div className="post_menu" role="menu">
                  <button type="button" className="post_menuItem" role="menuitem" onClick={handleShareClick} title="Copy link">
                    <i className="bx bx-link-alt" aria-hidden="true"></i>
                    <span>{copied ? 'Copied!' : 'Copy link'}</span>
                  </button>

                {isAdmin && (
                  <button
                    type="button"
                    className="post_menuItem"
                    role="menuitem"
                    onClick={handleToggleStatus}
                    title={activeState ? 'Set Inactive' : 'Set Active'}
                  >
                    <i className={`bx ${activeState ? 'bx-toggle-left' : 'bx-toggle-right'}`} aria-hidden="true"></i>
                    <span>{activeState ? 'Set Inactive' : 'Set Active'}</span>
                  </button>
                )}
                  {canManage && (
                    <>
                      <button
                        type="button"
                        className="post_menuItem"
                        role="menuitem"
                        onClick={handleToggleLock}
                        title={lockedState ? 'Unlock post' : 'Lock post'}
                      >
                        <i className={`bx ${lockedState ? 'bx-lock-open' : 'bx-lock'}`} aria-hidden="true"></i>
                        <span>{lockedState ? 'Unlock post' : 'Lock post'}</span>
                      </button>

                      <button
                        type="button"
                        className="post_menuItem"
                        role="menuitem"
                        onClick={() => { setEditOpen(true); setMenuOpen(false); }}
                      >
                        <i className='bx bx-pencil' aria-hidden="true"></i>
                        <span>Edit post</span>
                      </button>

                      <button
                        type="button"
                        className="post_menuItem"
                        role="menuitem"
                        onClick={handleDeleteClick}
                        disabled={deleting}
                      >
                        <i className='bx bx-trash-alt' aria-hidden="true"></i>
                        <span>Delete post</span>
                      </button>
                    </>
                  )}
                <Confirm
                  open={confirmOpen}
                  title="Are you sure you want to delete this post?"
                  confirmText={deleting ? 'Deleting…' : 'Delete'}
                  cancelText="Cancel"
                  onConfirm={handleConfirmDelete}
                  onCancel={() => setConfirmOpen(false)}
                  className="post_confirm"
                />
              
              
              </div>
              )}
            </div>
            </div>
          <span className="post_sub">{createdStr}</span>
          
        </div>
        <EditPostForm
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onUpdated={() => {
            setEditOpen(false);
            dispatch(refetchPosts('feed'));
          }}
          postId={id}
          initialTitle={title}
          initialContent={content}
          initialCategories={categories}
          currentUserId={currentUserId}
          authorId={authorId}
          isAdmin={isAdmin}
        />
      </header>

      <h3 className="post_title">{title}</h3>
      {content ? <p className="post_preview">{content}</p> : null}

      <footer className="post_footer" aria-label="post actions">
        <div className="post_interactive">
         <Reaction
          postId={id}
          initialLike={likes ?? 0}
          initialDislike={dislikes ?? 0}
          initialMy={myReaction ?? null}
          fetchOnMount={reactionFetchOnMount}
          syncMineOnlyOnMount={reactionMineOnlyOnMount}
          />
        </div>
        <span className="post_comments" title="comments" aria-label="comments count">
          <i class='bx bx-message' aria-hidden="true"></i> 
          <span className="comment-count">{comments ?? 0}</span>
        </span>
        <div className="post_interactive">
          <Bookmark
            postId={id}
            initial={!!bookmarked}
          />
        </div>
      </footer>
    </article>
  );
};

Post.propTypes = {
  id: PropTypes.number.isRequired,
  authorId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  author: PropTypes.string.isRequired,
  authorPicUrl: PropTypes.string,
  authorRating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  title: PropTypes.string.isRequired,
  content: PropTypes.string,
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  likes: PropTypes.number,
  dislikes: PropTypes.number,
  myReaction: PropTypes.oneOf(['like', 'dislike', null]),
  comments: PropTypes.number,
  bookmarked: PropTypes.bool,
  categories: PropTypes.arrayOf(PropTypes.string),
  locked: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  onBookmarkChange: PropTypes.func,
  reactionFetchOnMount: PropTypes.bool,
  reactionMineOnlyOnMount: PropTypes.bool,
};

Post.defaultProps = {
  authorPicUrl: '',
  content: '',
  likes: 0,
  dislikes: 0,
  myReaction: null,
  comments: 0,
  bookmarked: false,
  onBookmarkChange: undefined,
  categories: [],
  locked: 0,
  reactionFetchOnMount: true,
  reactionMineOnlyOnMount: false,
};

export default Post;
