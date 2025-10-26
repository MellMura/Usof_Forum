import React, { useEffect, useMemo, useCallback } from 'react';
import Post from './index';
import { useDispatch, useSelector } from 'react-redux';
import CommentsThread from '../comment/CommentsThread';
import CommentForm from '../comment/CommentForm';
import { fetchPostById } from '../store/postsActions';
import { fetchComments, addComment } from '../store/commentsActions';
import { useAuthUser } from '../auth/useAuth';

import './PostPage.css';

function buildTree(list) {
  const byId = new Map();
  const roots = [];
  list.forEach(c => byId.set(c.id, { ...c, children: [] }));

  byId.forEach(n => {
    const pid = n.parent_id ?? null;
    if (pid && byId.has(pid)) byId.get(pid).children.push(n);
    else roots.push(n);
  });

      const scoreOf = (x) => (Number(x.likes) || 0) - (Number(x.dislikes) || 0);    
      const timeOf = (x) => x.created_at ? Date.parse(x.created_at) || 0 : Number(x.id) || 0;
      const sortByPopularityDesc = (a, b) => {
      const d = scoreOf(b) - scoreOf(a);
      return d !== 0 ? d : timeOf(b) - timeOf(a);
  };
  
  const sortDeep = (n) => {
    n.children.sort(sortByPopularityDesc);
    n.children.forEach(sortDeep);
  };

    roots.sort(sortByPopularityDesc);
    roots.forEach(sortDeep);

  return roots;
}

export default function PostPage() {
  const postId = useMemo(() => {
    const m = window.location.pathname.match(/^\/post\/(\d+)/);
    return m ? Number(m[1]) : null;
  }, []);

  const dispatch = useDispatch();

  const post = useSelector((s) => {
    if (!postId) return null;

    const cached = s.posts?.byId?.[postId];
    if (cached) return cached;

    const lists = [
      s.posts?.feed?.items,
      s.posts?.search?.items,
      s.posts?.profile?.items,
    ].filter(Boolean);

    for (const arr of lists) {
      const found = arr.find((p) => Number(p.id) === Number(postId));
      if (found) return found;
    }
    return null;
  });

  const loading = useSelector(
    (s) => s.posts?.feed?.status === 'loading' || s.posts?.search?.status === 'loading'
  );

  const {
    status: commentsStatus,
    postId: commentsPostId,
    items: justComments,
  } = useSelector((s) => s.comments);

  const authUser = useAuthUser() || null;
  const currentUserId = authUser?.id ?? null;
  const isAdmin = authUser?.status === 'admin';

  useEffect(() => {
    if (!postId || !Number.isFinite(postId)) return;
    dispatch(fetchPostById(postId));
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const handleCreated = useCallback(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const isLocked = Number(post?.locked) === 1;
  const isActive = post?.status === 'active';

  const canReply = Boolean(currentUserId) && Boolean(isActive) && (!isLocked || isAdmin);

  const disabledReason = (() => {
    if (!currentUserId) return 'Log in to comment.';
    if (post && !isActive) return 'This post is inactive. Commenting is disabled.';
    if (post && isLocked && !isAdmin) return 'This post is locked. New comments are disabled.';
    return null;
  })();

  const onReply = useCallback(
    async (parentId, text) => {
      if (!canReply) {
        throw new Error(disabledReason || 'Commenting is disabled.');
      }
      const res = await dispatch(addComment(postId, text, parentId));
      if (!res?.ok) {
        throw new Error(res?.error?.message || 'Failed to reply');
      }
      await dispatch(fetchComments(postId));
    },
    [dispatch, postId, canReply, disabledReason]
  );

  if (!postId || !Number.isFinite(postId)) return <p>Post not found.</p>;
  if (loading && !post) return <p>Loading…</p>;
  if (!post) return <p>Post not found.</p>;

  const cats = Array.isArray(post.categories) ? post.categories : [];
  const showComments = commentsPostId === post.id;
  const tree = showComments ? buildTree(justComments) : [];

  return (
    <main className="feed" style={{ maxWidth: 900, margin: '16px auto', padding: '0 12px' }}>
      {cats.length > 0 && (
        <div className="pillbar" aria-label="Post categories">
          {cats.map((name) => (
            <span key={name} className="pill" title={name}>
              {name}
            </span>
          ))}
        </div>
      )}

      <Post
        id={post.id}
        currentUserId={currentUserId ?? undefined}
        authorId={post.author_id}
        authorRating={post.author_rating}
        authorPicUrl={post.pic_url}
        author={post.author}
        isAdmin={isAdmin}
        status={post.status}
        authorStatus={post.author_status}
        title={post.title}
        content={post.content || ''}
        createdAt={post.created_at}
        likes={post.likes ?? 0}
        dislikes={post.dislikes ?? 0}
        myReaction={post.myReaction ?? null}
        categories={post.categories}
        locked={isLocked}
        comments={post.comments_count ?? justComments.length}
        bookmarked={post.bookmarked ?? false}
        reactionFetchOnMount={true}
      />

      <section style={{ marginTop: 16 }}>
        {canReply ? (
          <CommentForm postId={post.id} onCreated={handleCreated} />
        ) : (
          <p style={{ opacity: 0.8 }}>{disabledReason}</p>
        )}
      </section>

      <section style={{ marginTop: 16 }}>
        <h3 style={{ margin: '12px 0' }}>Comments ({showComments ? justComments.length : 0})</h3>

        {commentsStatus === 'loading' && <p>Loading comments…</p>}
        {commentsStatus === 'error' && <p>Couldn’t load comments.</p>}
        {commentsStatus === 'idle' && showComments && justComments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <ul className="comments-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tree.map((node) => (
              <li key={node.id} style={{ padding: '10px 0' }}>
                <CommentsThread
                  node={node}
                  onReply={onReply}
                  currentUserId={currentUserId}
                  postAuthorId={post.author_id}
                  isAdmin={isAdmin}
                  postActive={Boolean(isActive)}
                  postLocked={Boolean(isLocked)}
                  canReply={canReply}
                  disabledReason={disabledReason}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

