import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchReactions, setReaction, deleteReaction } from './ReactionAPI';
import { useAuthUser } from '../auth/useAuth';
import './Reaction.css';

const Reaction = ({
  id,
  postId,
  kind = 'post',
  initialLike = 0,
  initialDislike = 0,
  initialMy = null,
  fetchOnMount = true,
  syncMineOnlyOnMount = false,
}) => {
  const targetId = id ?? postId;
  const user = useAuthUser();

  const [like, setLike] = useState(initialLike);
  const [dislike, setDislike] = useState(initialDislike);
  const [mine, setMine] = useState(initialMy);
  const [busy, setBusy] = useState(false);

  const sameId = (a, b) => a != null && b != null && String(a) === String(b);

  useEffect(() => {
    if (!targetId || !fetchOnMount) return;
    let alive = true;

    (async () => {
      try {
        const res = await fetchReactions(kind, targetId);
        if (!alive) return;

        const nextLike = res.like ?? 0;
        const nextDislike = res.dislike ?? 0;

        let nextMine = res.myReaction ?? null;

        if (nextMine == null && user?.id != null) {
          const mineItem = (res.items || []).find(it => sameId(it.user_id, user.id));
          if (mineItem?.type === 'like' || mineItem?.type === 'dislike') {
            nextMine = mineItem.type;
          }
        }

        if (!syncMineOnlyOnMount) {
          setLike(nextLike);
          setDislike(nextDislike);
        }

        setMine(prev => (nextMine != null ? nextMine : prev));

      } catch { }
    })();
    return () => { alive = false; };
  }, [kind, targetId, fetchOnMount, syncMineOnlyOnMount, user?.id]);

  const toggle = async (next) => {
    if (busy || !targetId) return;
    setBusy(true);

    const prev = mine;

    if (prev === next) {
      if (next === 'like') setLike(v => Math.max(0, v - 1));
      if (next === 'dislike') setDislike(v => Math.max(0, v - 1));
      setMine(null);
    } else {
      if (prev === 'like') setLike(v => Math.max(0, v - 1));
      if (prev === 'dislike') setDislike(v => Math.max(0, v - 1));
      if (next === 'like') setLike(v => v + 1);
      if (next === 'dislike') setDislike(v => v + 1);
      setMine(next);
    }

    try {
      const res = prev === next
        ? await deleteReaction(kind, targetId)
        : await setReaction(kind, targetId, next);

      setLike(res.like ?? 0);
      setDislike(res.dislike ?? 0);
      setMine((prevMine) => (res.myReaction != null ? res.myReaction : prevMine));
    } catch {
      try {
        const res = await fetchReactions(kind, targetId);
        setLike(res.like ?? 0);
        setDislike(res.dislike ?? 0);

        let nextMine = res.myReaction ?? null;

        if (nextMine == null && user?.id != null) {
          const mineItem = (res.items || []).find((it) => sameId(it.user_id, user.id));
          
          if (mineItem?.type === 'like' || mineItem?.type === 'dislike') {
            nextMine = mineItem.type;
          }
        }

        setMine(prevMine => (nextMine != null ? nextMine : prevMine));
      } catch {}

      alert('Could not update reaction.');
    } finally {
      setBusy(false);
    }
  };

  const likeIcon = mine === 'like' ? 'bxs-like' : 'bx-like';
  const dislikeIcon = mine === 'dislike' ? 'bxs-dislike' : 'bx-dislike';

   return (
    <div className="reaction-icons" role="group" aria-label="Reactions">
      <button
        type="button"
        className={`icon-btn ${mine === 'like' ? 'is-active' : ''}`}
        onClick={() => toggle('like')}
        disabled={busy}
        aria-pressed={mine === 'like'}
        title="Like"
      >
        <i className={`bx ${likeIcon}`} aria-hidden="true" />
        
      </button>
      <span className="count">{like}</span>
      <button
        type="button"
        className={`icon-btn ${mine === 'dislike' ? 'is-active' : ''}`}
        onClick={() => toggle('dislike')}
        disabled={busy}
        aria-pressed={mine === 'dislike'}
        title="Dislike"
      >
        <i className={`bx ${dislikeIcon}`} aria-hidden="true" />
      </button>
      <span className="count">{dislike}</span>
    </div>
  );
}

Reaction.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  kind: PropTypes.oneOf(['post', 'comment']),
  postId: PropTypes.number,
  initialLike: PropTypes.number,
  initialDislike: PropTypes.number,
  initialMy: PropTypes.oneOf(['like', 'dislike', null]),
  fetchOnMount: PropTypes.bool,
  syncMineOnlyOnMount: PropTypes.bool,
};

export default Reaction;
