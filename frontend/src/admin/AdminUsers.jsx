import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserInfoCard from '../profile/ProfileCard';
import { fetchAdminUsers, deleteAvatarThunk, deleteUserThunk } from '../store/profileActions';
import { blockUserThunk, unblockUserThunk } from '../store/blocksActions';
import AddUserForm from './AddUserForm';
import ProfileEditForm from '../profile/ProfileEditForm';
import './AdminPanel.css';

export default function AdminUsers({authUserId, isAdmin}) {
  const dispatch = useDispatch();
  const [openAdd, setOpenAdd] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { items, status, error } = useSelector((s) => s.profile?.usersList || {
    items: [], status: 'idle', error: null,
  });

  const blockedSet = useSelector((s) => {
    const arr = s.blocks?.items || [];
    const set = new Set();
    for (const item of arr) {
      const id = Number(item.id ?? item.target_id ?? item.user_id ?? item.blocked_id);
      if (Number.isFinite(id)) set.add(id);
    }
    return set;
  });

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)),
    [items]
  );

  const handleBlock = (userId) => dispatch(blockUserThunk(userId));
  const handleUnblock = (userId) => dispatch(unblockUserThunk(userId));

  const handleDeleteAvatar = (userId) => async () => {
    await dispatch(deleteAvatarThunk(userId));
    dispatch(fetchAdminUsers());
  };

  const handleDeleteUser = (userId) => async () => {
    await dispatch(deleteUserThunk(userId));
    dispatch(fetchAdminUsers());
  };

  if (status === 'loading') {
    return <div className="feed"><h2>Users</h2><p>Loading…</p></div>;
  }
  if (status === 'error') {
    return <div className="feed"><h2>Users</h2><p>Error: {error}</p></div>;
  }

  return (
    <div className="feed">
      <h2 style={{ margin: '12px 0' }}>Users <small style={{ fontWeight: 400 }}>({sorted.length})</small></h2>

      <div className="admin_btn">
        <button className="btn" type="button" onClick={() => setOpenAdd(true)}>Create new user</button>
      </div>

      <div className="cards">
        {sorted.map(u => {
          const isMine = authUserId != null && Number(authUserId) === Number(u.id);
          const isBlocked = blockedSet.has(Number(u.id)) || Boolean(u.blocked);

          return (
            <UserInfoCard
              key={u.id}
              id={u.id}
              login={u.login}
              fullName={u.full_name || ''}
              rating={u.rating ?? 0}
              status={u.status || 'user'}
              //elo={u.elo ?? 0}
              picUrl={u.pic_url || u.avatar_url || ''}
              blocked={Boolean(isBlocked)}
              isAdmin={isAdmin}
              isMine={isMine}
              canEdit
              onEditClick={() => setEditingUser(u)}
              canChangeAvatar={false}
              canDeleteAvatar={true}
              onDeleteAvatar={handleDeleteAvatar(u.id)}
              onBlock={handleBlock}
              onUnblock={handleUnblock}
              onDeleteUser={handleDeleteUser(u.id)}
            />
          );
        })}
      </div>

      {sorted.length === 0 && <p>No users.</p>}

      <AddUserForm
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={() => {
          setOpenAdd(false);
          dispatch(fetchAdminUsers());
        }}
      />

      <ProfileEditForm
        open={!!editingUser}
        onClose={() => {
          setEditingUser(null);
          dispatch(fetchAdminUsers());
        }}
        user={editingUser}
        isAdmin={true}
      />
    </div>
  );
}