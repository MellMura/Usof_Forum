import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Post from '../post';
import ProfileCard from './ProfileCard';
import { useAuthUser } from '../auth/useAuth';
import Confirm from '../common/Confirm';
import CategoriesList from '../categories';

import ProfileEditForm from './ProfileEditForm';

import { fetchProfileUser, uploadAvatarThunk, deleteAvatarThunk, deleteUserThunk } from '../store/profileActions';
import { fetchProfilePosts } from '../store/postsActions';
import { fetchPosts } from '../store/postsActions';
import { fetchBlockedUsers, blockUserThunk, unblockUserThunk } from '../store/blocksActions';
import { selectIsUserBlocked } from '../store/blocksActions';

import './ProfilePage.css';

function useQueryParams() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const params = useQueryParams();

  const userIdRaw = params.get('u');
  const userId = userIdRaw != null ? Number(userIdRaw) : null;

  const { status, error, user } = useSelector((s) => s.profile || {
    status: 'idle', error: null, user: null, posts: [],
  });

  const isBlocked = useSelector((s) => selectIsUserBlocked(s, user?.id));

  const authUser = useAuthUser(); 
  const authUserId = authUser?.id ?? null;
  const isAdmin = authUser?.status === 'admin';

  const isMine = authUserId != null && user?.id != null && Number(authUserId) === Number(user.id);
  const canEdit = !!(isMine || isAdmin);
  const canChangeAvatar = isMine;
  const canDeleteAvatar = isMine || isAdmin;

  const [confirmOpen, setConfirmOpen] = useState(false);

  const onAvatarSelect = (file) => {
    dispatch(uploadAvatarThunk(file)).catch(console.error);
  };

  const onDeleteAvatar = () => {
    if (isAdmin && !isMine) setConfirmOpen(true);
    else confirmDelete();
  };

  const confirmDelete = () => {
    setConfirmOpen(false);
    dispatch(deleteAvatarThunk(user.id)).catch(console.error);
  };

  const [editing, setEditing] = useState(false);

  const [filters, setFilters] = useState({
    categories: [],
    date_from: '',
    date_to: '',
    sort: 'created_at',
    order: 'desc',
  });

  const [openFilters, setOpenFilters] = useState(false);

  const items = useSelector((s) => s.posts?.profile?.items || []);
  const postsStatus = useSelector((s) => s.posts?.profile?.status || 'idle');

  useEffect(() => {
    if (!Number.isFinite(userId) || userId <= 0) return;

    dispatch(fetchProfileUser(userId));
    dispatch(fetchBlockedUsers());
  }, [userId, dispatch])

  const postParams = useMemo(() => {
    if (!user?.id) return null;
    const p = {
      page: 1,
      limit: 10,
      sort: filters.sort || 'created_at',
      order: (filters.order || 'desc').toLowerCase(),
      author_id: user.id,
    };

    if (filters.categories?.length) p.categories = filters.categories.join(',');
    if (filters.date_from) p.date_from = filters.date_from;
    if (filters.date_to) p.date_to = filters.date_to;
    if (isAdmin && filters.status) p.status = filters.status;
    return p;
  }, [user?.id, isAdmin, filters.date_from, filters.date_to, filters.status, (filters.categories || []).join(','), filters.sort, filters.order,
]);

  useEffect(() => {
    if (!postParams) return;
    dispatch(fetchPosts(postParams, { place: 'profile', append: false }));
  }, [dispatch, postParams]);

  const setCategories = (ids) => {
    setFilters((prev) => {
      const before = prev.categories || [];
      const sameLen = before.length === ids.length;
      const sameItems = sameLen && before.every((v, i) => v === ids[i]);
      return sameItems ? prev : { ...prev, categories: ids };
    });
  };
  
  const filtersActive =
    (filters.categories?.length ?? 0) > 0 ||
    !!filters.date_from ||
    !!filters.date_to ||
    !!(isAdmin && filters.status);

  const onBlock = (targetId) => dispatch(blockUserThunk(targetId));
  const onUnblock = (targetId) => dispatch(unblockUserThunk(targetId));
  const onEditClick = () => setEditing(true);
  
  if (!Number.isFinite(userId) || userId <= 0) {
    return <p>User not found.</p>;
  }

  if (status === 'loading') return <p>Loading profile…</p>;
  if (status === 'error' || !user) return <p>{error || 'User not found.'}</p>;

  return (
    <>
      <main className="profile_main">
        <section className="profile_section">
          <h2 className="profile_h2">Profile</h2>
          <div style={{ marginTop: 8 }}>
            <ProfileCard
              id={user.id}
              login={user.login}
              fullName={user.full_name}
              rating={user.rating}
              status={user.status}
              //elo={user.elo ?? 0}
              picUrl={user.pic_url}
              blocked={!!isBlocked}
              onBlock={onBlock}
              onUnblock={onUnblock}
              canEdit={canEdit}
              onEditClick={onEditClick}
              canChangeAvatar={canChangeAvatar}
              canDeleteAvatar={canDeleteAvatar}
              isAdmin={isAdmin}
              isMine={isMine}
              onAvatarSelect={onAvatarSelect}
              onDeleteAvatar={onDeleteAvatar}
              onDeleteUser={(uid) => dispatch(deleteUserThunk(uid))}
            />
          </div>
        </section>

        <Confirm
          open={confirmOpen}
          title="Delete this user's avatar?"
          message={`This will permanently remove ${user.login}'s avatar.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />

        <ProfileEditForm
          open={editing}
          onClose={() => setEditing(false)}
          user={user}
          isAdmin={isAdmin}
        />

        <section className="profile_section">
          <h2 className="profile_h2">Posts by {user.login}</h2>
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
          <div className="feed">
              {postsStatus === 'loading' && <p>Loading…</p>}
              {postsStatus === 'error' && <p>Couldn’t load posts.</p>}
              {postsStatus === 'idle' && items.length === 0 && (
                <p>
                  No posts yet{filtersActive ? ' in selected filters' : ''}.
                </p>
              )}
              {items.map((p) => (
                <Post
                  key={p.id}
                  id={p.id}
                  currentUserId={authUserId ?? undefined}
                  authorId={p.author_id}
                  authorStatus={p.author_status}
                  author={p.author}
                  authorRating={p.author_rating}
                  isAdmin={isAdmin}
                  status={p.status}
                  authorPicUrl={user.pic_url}
                  title={p.title}
                  content={(p.content || '').slice(0, 220)}
                  createdAt={p.created_at}
                  likes={p.likes ?? 0}
                  dislikes={p.dislikes ?? 0}
                  myReaction={p.myReaction ?? null}
                  comments={p.comments_count ?? 0}
                  categories={p.categories}
                  bookmarked={p.bookmarked ?? false}
                />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
