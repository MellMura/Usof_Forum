import { req } from '../common/APIUtils';

export async function fetchReactions(kind, id) {
  const path = kind === 'comment'
    ? `/api/comments/${id}/like`
    : `/api/posts/${id}/like`;

  const data = await req(path);

  const like = data?.summary?.like ?? data?.like ?? data?.likes ?? 0;
  const dislike = data?.summary?.dislike ?? data?.dislike ?? data?.dislikes ?? 0;
  const myReaction =
    data?.summary?.myReaction ?? data?.myReaction ?? data?.my ?? null;

  return { like, dislike, myReaction, items: data?.items || [] };
}

export async function setReaction(kind, id, type) {
  const path = kind === 'comment'
    ? `/api/comments/${id}/like`
    : `/api/posts/${id}/like`;

  const data = await req(path, { method: 'POST', body: { type } });

  const like = data?.summary?.like ?? data?.like ?? data?.likes ?? 0;
  const dislike = data?.summary?.dislike ?? data?.dislike ?? data?.dislikes ?? 0;
  const myReaction =
    data?.summary?.myReaction ?? data?.myReaction ?? data?.my ?? null;

  return { like, dislike, myReaction, items: data?.items || [] };
}

export async function deleteReaction(kind, id) {
    const path = kind === 'comment'
      ? `/api/comments/${id}/like`
      : `/api/posts/${id}/like`;
  
    const data = await req(path, { method: 'DELETE' });
  
    if (data == null) {
      return fetchReactions(kind, id);
    }
  
    const like = data?.summary?.like ?? data?.like ?? data?.likes ?? 0;
    const dislike = data?.summary?.dislike ?? data?.dislike ?? data?.dislikes ?? 0;
    const myReaction =
      data?.summary?.myReaction ?? data?.myReaction ?? data?.my ?? null;
  
    return { like, dislike, myReaction, items: data?.items || [] };
  }
