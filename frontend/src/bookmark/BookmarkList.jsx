import React, { useEffect, useState } from 'react';
import Post from '../post';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookmarks, removeBookmarkOptimistic } from '../store/bookmarksActions';

import '../feed/Feed.css';

const Bookmarks = ({currentUserId, authUser, isAdmin}) => {
  const dispatch = useDispatch();

  const { items, status } = useSelector((s) => s.bookmarks);

  const [cats, setCats] = useState([]);

  useEffect(() => {
    const params = { page: 1, limit: 10, sort: 'likes', order: 'desc' };
    if (cats.length) params.categories = cats.join(',');
    dispatch(fetchBookmarks(params));
  }, [dispatch, cats]);

  const handleBookmarkChange = (postId, isBookmarked) => {
    if (!isBookmarked) {
      dispatch(removeBookmarkOptimistic(postId));
    }
  };

  return (
    <>
      <main className="feed">
        <h2 style={{ margin: '12px 0' }}>Bookmarked posts</h2>
        {status === 'loading' && <p>Loading…</p>}
        {status === 'error' && <p>Couldn’t load your bookmarks.</p>}
        {status === 'idle' && items.length === 0 && (
          <p>No bookmarks yet{cats.length ? ' in selected categories' : ''}.</p>
        )}

        {items.map((p) => (
          <Post
            key={p.id}
            id={p.id}
            currentUserId={currentUserId ?? undefined}
            author={p.author}
            authorId={p.author_id}
            authorRating={p.author_rating}
            authorPicUrl={p.pic_url}
            status={p.status}
            authorStatus={p.author_status}
            isAdmin={isAdmin}
            title={p.title}
            content={(p.content || '').slice(0, 220)}
            createdAt={p.created_at}
            likes={p.likes ?? 0}
            dislikes={p.dislikes ?? 0}
            myReaction={p.myReaction ?? null}
            comments={p.comments_count ?? 0}
            bookmarked={true}
            locked={p.locked}
            categories={p.categories}
            onBookmarkChange={handleBookmarkChange}
            reactionFetchOnMount={true}
          />
        ))}
      </main>
    </>
  );
};

export default Bookmarks;
