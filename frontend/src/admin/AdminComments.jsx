import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CommentCard from '../comment/CommentCard';
import { fetchAllCommentsAdmin } from '../store/commentsActions';
import './AdminPanel.css';

export default function AdminComments() {
  const dispatch = useDispatch();
  const { items = [], status = 'idle', error = null } =
    useSelector((s) => s.comments?.admin || {});

  const refetch = useCallback(() => {
    dispatch(fetchAllCommentsAdmin({ page: 1, limit: 50, sort: 'date', order: 'desc' }));
  }, [dispatch]);

  useEffect(() => {
    refetch();
  }, [refetch]);
  
  if (status === 'loading') {
    return (
      <div className="feed">
        <h2>Comments</h2>
        <p>Loading…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="feed">
        <h2>Comments</h2>
        <p>Error: {error}</p>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => {
    const ta = new Date(a.created_at || 0).getTime();
    const tb = new Date(b.created_at || 0).getTime();
    return tb - ta;
  });

  return (
    <div className="feed">
      <h2 style={{ margin: '12px 0' }}>
        Comments <small style={{ fontWeight: 400 }}>({sorted.length})</small>
      </h2>

      <div className="cards">
        {sorted.map((c) => (
          <CommentCard
            key={c.id}
            id={c.id}
            onDeleted={refetch}
            authorId={c.author_id}
            author={c.author}
            authorPicUrl={c.pic_url}
            userStatus={c.author_status}
            authorRating={c.author_rating}
            createdAt={c.created_at}
            content={c.content}
            likes={c.likes}
            dislikes={c.dislikes}
            myReaction={c.myReaction ?? null}
            isAdmin
            currentUserId={null}
            postAuthorId={null}
            locked={c.locked}
            postActive={true}
          />
        ))}
      </div>

      {sorted.length === 0 && <p>No comments.</p>}
    </div>
  );
}
