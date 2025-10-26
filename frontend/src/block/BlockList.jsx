import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProfileCard from '../profile/ProfileCard';
import { fetchBlockedUsers, unblockUserThunk } from '../store/blocksActions';

import '../profile/ProfilePage.css';

const BlockList = () => {
  const dispatch = useDispatch();

  const { items, status, error } = useSelector((s) => s.blocks);
  const [busyIds, setBusyIds] = useState(() => new Set());

  useEffect(() => {
    dispatch(fetchBlockedUsers());
  }, [dispatch]);

  const handleUnblock = async (id) => {
    setBusyIds((s) => new Set(s).add(id));
    try {
      await dispatch(unblockUserThunk(id));
    } finally {
      setBusyIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  };


  return (
    <main className="feed" style={{ maxWidth: 900, margin: '16px auto', padding: '0 12px' }}>
      <h2 style={{ margin: '12px 0' }}>Blocked users</h2>

      {status === 'loading' && <p>Loading…</p>}
      {status === 'error' && <p>Couldn’t load your block list.</p>}
      {status === 'idle' && items.length === 0 && <p>Your block list is empty.</p>}

      {items.map(u => (
        <div key={u.id} style={{ marginBottom: 12 }}>
          <ProfileCard
            id={u.id}
            login={u.login}
            fullName={u.full_name}
            rating={u.rating}
            status={u.status}
            //elo={u.elo ?? 0}
            picUrl={u.pic_url}
            blocked={true}
            onUnblock={() => handleUnblock(u.id)}
            busy={busyIds.has(u.id)} 
          />
        </div>
      ))}
    </main>
  );
};

export default BlockList;
