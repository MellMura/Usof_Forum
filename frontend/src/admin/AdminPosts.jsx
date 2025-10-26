import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuthUser } from '../auth/useAuth';
import Post from '../post/Post';
import { fetchPosts, markPostBookmarked, refetchPosts  } from '../store/postsActions';
import AddPostForm from '../postForm/AddPostForm';
import './AdminPanel.css';

export default function AdminPosts(isAdmin) {
  const dispatch = useDispatch();
  const [openAdd, setOpenAdd] = useState(false);
  const authUser = useAuthUser();
  const currentUserId = authUser?.id ?? null;
  const { items = [], status = 'idle', error = null } = useSelector((s) => s.posts?.admin || {});

  useEffect(() => {
    dispatch(fetchPosts(
      { page: 1, limit: 20, sort: 'date', order: 'desc' },
      { place: 'admin', append: false }
    ));
  }, [dispatch]);

  if (status === 'loading') {
    return <div className="feed"><h2>Posts</h2><p>Loading…</p></div>;
  }
  if (status === 'error') {
    return <div className="feed"><h2>Posts</h2><p>Error: {error}</p></div>;
  }

  const sorted = [...items].sort((a, b) => {
    const ta = new Date(a.created_at || a.createdAt || 0).getTime();
    const tb = new Date(b.created_at || b.createdAt || 0).getTime();
    return tb - ta;
  });


  return (
    <div className="feed">
      <h2 style={{ margin: '12px 0' }}>Posts <small style={{ fontWeight: 400 }}>({sorted.length})</small></h2>

      <div className="admin_btn">
        <button className="btn" type="button" onClick={() => setOpenAdd(true)}>Create new post</button>
      </div>

      <div className="posts">
      {sorted.map(p => (
        <Post
            key={p.id}
            id={p.id}
            currentUserId={currentUserId}
            authorId={p.author_id}
            author={p.author}
            authorStatus={p.author_status}
            authorPicUrl={p.pic_url}
            authorRating={p.author_rating}
            title={p.title}
            isAdmin={isAdmin}
            status={p.status}
            content={(p.content || '').slice(0, 220)}
            createdAt={p.created_at}
            likes={p.likes}
            dislikes={p.dislikes}
            myReaction={p.myReaction ?? null}
            comments={p.comments}
            categories={p.categories}
            bookmarked={p.bookmarked ?? false}
            onBookmarkChange={(postId, saved) =>
                dispatch(markPostBookmarked(postId, saved))
            }
            reactionFetchOnMount
            reactionMineOnlyOnMount
            locked={p.locked}
        />
        ))}
      </div>
      

      {sorted.length === 0 && <p>No posts.</p>}

      <AddPostForm
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={() => {
          setOpenAdd(false);
          dispatch(refetchPosts('admin'));
        }}
      />
    </div>
  );
}
