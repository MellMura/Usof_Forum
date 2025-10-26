import React, { useEffect, useMemo, useState } from 'react';
import Post from '../post';
import PropTypes from 'prop-types';
import { useAuthUser } from '../auth/useAuth';
import CategoriesList from '../categories';
import { useDispatch, useSelector } from 'react-redux'
import { fetchPosts, markPostBookmarked } from '../store/postsActions';
import { useFurtherLoader } from '../common/paging';

import './Feed.css';

const PAGE_LIMIT = 10;

const Feed = ({ filters, setFilters, openFilters, setOpenFilters, isAdmin, user, place = 'feed'}) => {
  const authUser = useAuthUser();
  const currentUserId = user?.id ?? authUser?.id ?? null
  
  const dispatch = useDispatch();

  const items  = useSelector((s) => s.posts?.[place]?.items)  || [];
  const status = useSelector((s) => s.posts?.[place]?.status) || 'idle';
  
  //for paging optimization
  const hasMore = useSelector((s) => s.posts?.[place]?.hasMore) || false;

  const params = useMemo(() => {
    const p = {
      limit: PAGE_LIMIT,
      sort: filters.sort || 'created_at',
      order: (filters.order || 'desc').toLowerCase(),
    };

    if (filters.categories?.length) p.categories = filters.categories.join(',');
    if (filters.date_from) p.date_from = filters.date_from;
    if (filters.date_to) p.date_to = filters.date_to;
    if (filters.author_id) p.author_id = filters.author_id;
    if (isAdmin && filters.status) p.status = filters.status;

    return p;
  }, [
    isAdmin,
    filters.date_from,
    filters.date_to,
    filters.author_id,
    filters.status,
    filters.sort,
    filters.order,
    (filters.categories || []).join(','),
  ]);

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [params]);

  useEffect(() => {
    const params2 = { ...params, page };
    dispatch(fetchPosts(params2, { append: page > 1, place }));
  }, [dispatch, params, page, place]);

    
  const { endRef } = useFurtherLoader({
    loadMore: () => setPage((p) => p + 1),
    hasMore,
    isBusy: status === 'loading',
    rootMargin: '800px 0px',
  });

  const setCategories = (ids) => {
    setFilters((prev) => {
      const before = (prev.categories || []).map(Number);
      const next   = (ids || []).map(Number);

      if (before.length !== next.length) return { ...prev, categories: next };

      const set = new Set(before);

      for (const v of next) if (!set.has(v)) return { ...prev, categories: next };
      return prev;
    });
  };

  const filtersActive =
  (filters.categories?.length ?? 0) > 0 ||
  !!filters.date_from ||
  !!filters.date_to ||
  !!filters.author_id ||
  !!(isAdmin && filters.status);
  
    return (
      <>
        <CategoriesList
          initial={filters.categories}
          onChange={setCategories}
          onOpenFilters={() => setOpenFilters(true)}
          openFilters={openFilters}
          onCloseFilters={() => setOpenFilters(false)}
          filters={filters}
          onApplyFilters={(next) => setFilters(next)}
          isAdmin={isAdmin}
          filtersActive={filtersActive}
        />
  
  <main className="feed">
  {status === 'loading' && page === 1 && <p>Loading…</p>}
  {status === 'error' && <p>Couldn’t load posts.</p>}
  {status === 'idle' && items.length === 0 && (
    <p>
      No posts yet
      {(filters.categories?.length ?? 0) > 0 ? ' in selected categories' : ''}.
    </p>
  )}
      {items.map((p) => (
          <Post
            key={p.id}
            id={p.id}
            currentUserId={currentUserId}
            isAdmin={authUser?.status === 'admin'}
            status={p.status}
            authorId={p.author_id}
            author={p.author}
            authorStatus={p.author_status}
            authorPicUrl={p.pic_url}
            authorRating={p.author_rating}
            title={p.title}
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
    
        {hasMore && <div ref={endRef} style={{ height: 1 }} />}

        {status === 'loading' && page > 1 && (
          <p style={{ textAlign: 'center' }}>Loading more…</p>
        )}
      </main>
      </>
    );
  };

Feed.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  openFilters: PropTypes.bool,
  setOpenFilters: PropTypes.func,
  isAdmin: PropTypes.bool,
  user: PropTypes.object,
};

export default Feed;
