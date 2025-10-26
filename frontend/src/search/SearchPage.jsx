import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProfileCard from '../profile/ProfileCard';
import Post from '../post';
import { useAuthUser } from '../auth/useAuth';
import { useFurtherLoader } from '../common/paging';
import { searchUsersFetch } from '../store/searchActions';
import { fetchPosts } from '../store/postsActions';

const USERS_PAGE_SIZE = 20;
const POSTS_PAGE_SIZE = 10;

function useLinkParam(name) {
  const read = () => new URLSearchParams(window.location.search).get(name) || '';
  const [value, setValue] = useState(read);

  useEffect(() => {
    const update = () => setValue(read());

    const origPush = window.history.pushState.bind(window.history);
    const origReplace = window.history.replaceState.bind(window.history);

    window.history.pushState = function (...args) {
      const res = origPush(...args);
      window.dispatchEvent(new Event('locationchange'));
      return res;
    };
    window.history.replaceState = function (...args) {
      const res = origReplace(...args);
      window.dispatchEvent(new Event('locationchange'));
      return res;
    };

    window.addEventListener('popstate', update);
    window.addEventListener('locationchange', update);

    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('locationchange', update);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, [name]);

  return value;
}

export default function SearchPage() {
  const dispatch = useDispatch();
  const q = useLinkParam('q').trim();

  const users = useSelector((s) => s.search?.users) || {
    q: '', items: [], status: 'idle', offset: 0, hasMore: false,
  };

  const postsPart = useSelector((s) => s.posts?.search) || {
    items: [], status: 'idle', hasMore: false, lastParams: null,
  };

  const [postPage, setPostPage] = useState(1);
  const authUser = useAuthUser() || null;
  const currentUserId = authUser?.id ?? null;
  const isAdmin = authUser?.status === 'admin';
  useEffect(() => {
    if (!q) return;
    //pagination for users
    dispatch(searchUsersFetch({ q, limit: USERS_PAGE_SIZE, reset: true }));
    setPostPage(1);
    dispatch(
      fetchPosts(
        { q, limit: POSTS_PAGE_SIZE, page: 1, sort: 'created_at', order: 'desc' },
        { place: 'search', append: false }
      )
    );
  }, [dispatch, q]);

  const { endRef: usersEndRef } = useFurtherLoader({
    hasMore: users.hasMore,
    isBusy: users.status === 'loading',
    loadMore: () => dispatch(searchUsersFetch({ q, limit: USERS_PAGE_SIZE })),
    rootMargin: '800px 0px',
  });

  //pagination for posts
  const { endRef: postsEndRef } = useFurtherLoader({
    hasMore: postsPart.hasMore,
    isBusy: postsPart.status === 'loading',
    loadMore: () => {
      const next = postPage + 1;
      setPostPage(next);
      dispatch(
        fetchPosts(
          { q, limit: POSTS_PAGE_SIZE, page: next, sort: 'created_at', order: 'desc' },
          { place: 'search', append: true }
        )
      );
    },
    rootMargin: '800px 0px',
  });

  if (!q) {
    return (
      <main className="feed">
        <h2>Search</h2>
        <p>To search for users or posts, type something in the header search box.</p>
      </main>
    );
  }

  return (
    <main className="feed">
      <h2 style={{ margin: '12px 0' }}>Search results for “{q}”</h2>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '8px 0 12px' }}>People</h3>

        {users.status === 'loading' && users.items.length === 0 && <p>Loading…</p>}
        {users.status === 'error' && users.items.length === 0 && <p>Couldn’t load users.</p>}
        {users.status !== 'loading' && users.items.length === 0 && <p>No users found.</p>}

        {users.items.map((u) => (
          <div key={u.id} style={{ marginBottom: 12 }}>
            <ProfileCard
              id={u.id}
              login={u.login}
              fullName={u.full_name}
              rating={u.rating}
              status={u.status}
              elo={u.elo ?? 0}
              picUrl={u.pic_url}
            />
          </div>
        ))}

        {users.hasMore && <div ref={usersEndRef} style={{ height: 1 }} />}
        {users.status === 'loading' && users.items.length > 0 && (
          <p style={{ textAlign: 'center' }}>Loading…</p>
        )}
      </section>

      <section>
        <h3 style={{ margin: '8px 0 12px' }}>Posts</h3>

        {postsPart.status === 'loading' && postsPart.items.length === 0 && <p>Loading…</p>}
        {postsPart.status === 'error' && postsPart.items.length === 0 && <p>Couldn’t load posts.</p>}
        {postsPart.status !== 'loading' && postsPart.items.length === 0 && <p>No posts found.</p>}

        {postsPart.items.map((p) => (
          <Post
            key={p.id}
            id={p.id}
            currentUserId={currentUserId ?? undefined}
            authorId={p.author_id}
            authorRating={p.author_rating}
            author={p.author}
            authorPicUrl={p.pic_url}
            title={p.title}
            isAdmin={isAdmin}
            authorStatus={p.author_status}
            status={p.status}
            content={(p.content || '').slice(0, 220)}
            createdAt={p.created_at}
            likes={p.likes ?? 0}
            dislikes={p.dislikes ?? 0}
            comments={p.comments_count ?? 0}
            categories={p.categories}
            locked={p.locked}
          />
        ))}

        {postsPart.hasMore && <div ref={postsEndRef} style={{ height: 1 }} />}
        {postsPart.status === 'loading' && postsPart.items.length > 0 && (
          <p style={{ textAlign: 'center' }}>Loading…</p>
        )}
      </section>
    </main>
  );
}