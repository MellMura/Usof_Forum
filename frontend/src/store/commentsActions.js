import { listAllComments, createComment, updateComment, toggleCommentLock, toggleCommentLockAdmin, toggleCommentStatusAdmin, deleteComment } from '../comment/CommentAPI';
import { getPostComments } from '../post/PostAPI';

//json responses to array converter
function makeArray(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;

  return input.items || [];
}

export const fetchComments = (postId) => async (dispatch) => {
  dispatch({ type: 'comments/fetch/request', meta: { postId } });

  try {
    const data = await getPostComments(postId);
    const items = makeArray(data);

    dispatch({ type: 'comments/fetch/success', payload: { postId, items } });
  } catch (e) {
    dispatch({
      type: 'comments/fetch/failure',
      payload: { postId },
      error: e?.message || 'Failed to load comments',
    });
  }
};

export const fetchAllCommentsAdmin = (params = {}) => async (dispatch) => {
  dispatch({ type: 'comments/admin/fetch/request', payload: { params } });
  try {
    const data = await listAllComments({ page: 1, limit: 50, sort: 'date', order: 'desc', ...params });
    const items = Array.isArray(data) ? data : (data.items || []);
    dispatch({ type: 'comments/admin/fetch/success', payload: { items, params } });
  } catch (e) {
    dispatch({ type: 'comments/admin/fetch/failure', error: e?.message || 'Failed to fetch all comments' });
  }
};

export const addComment = (postId, content, parent = null) => async (dispatch) => {
  dispatch({ type: 'comments/create/request', meta: { postId, parent } });

  try {
    const created = await createComment(postId, content, parent);

    dispatch({
      type: 'comments/create/success',
      payload: { postId, item: created, parent },
    });

    return { ok: true, item: created };
  } catch (e) {
    dispatch({
      type: 'comments/create/failure',
      payload: { postId, parent },
      error: e?.message || 'Failed to publish comment',
    });

    return { ok: false, error: e };
  }
};

export const updateCommentThunk = (commentId, content) => async (dispatch) => {
  dispatch({ type: 'comments/update/request', meta: { commentId } });
  try {
    const updated = await updateComment(commentId, { content });

    dispatch({ type: 'comments/update/success', payload: updated });
    return updated;
  } catch (e) {

    dispatch({
      type: 'comments/update/failure',
      meta: { commentId },
      error: e?.message || 'Failed to update comment',
    });

    throw e;
  }
};

export const toggleCommentLockThunk = (commentId, locked) => async (dispatch) => {
  dispatch({ type: 'comments/lock/request', meta: { commentId, locked } });
  try {
    const updated = await toggleCommentLock(commentId, locked);
    dispatch({ type: 'comments/lock/success', payload: updated });
    return updated;
  } catch (e) {
    dispatch({
      type: 'comments/lock/failure',
      meta: { commentId, locked },
      error: e?.message || 'Failed to update lock',
    });
    throw e;
  }
};

export const toggleCommentLockAdminThunk = (commentId, locked) => async (dispatch) => {
  dispatch({ type: 'comments/lock/request', meta: { commentId, locked, admin: true } });
  try {
    const updated = await toggleCommentLockAdmin(commentId, locked);
    dispatch({ type: 'comments/lock/success', payload: updated });
    return updated;
  } catch (e) {
    dispatch({
      type: 'comments/lock/failure',
      meta: { commentId, locked, admin: true },
      error: e?.message || 'Failed to update lock (admin)',
    });
    throw e;
  }
};

export const toggleCommentStatusAdminThunk = (commentId, status) => async (dispatch) => {
  dispatch({ type: 'comments/status/request', meta: { commentId, status } });
  try {
    const updated = await toggleCommentStatusAdmin(commentId, status);
    dispatch({ type: 'comments/status/success', payload: updated });
    return updated;
  } catch (e) {
    dispatch({
      type: 'comments/status/failure',
      meta: { commentId, status },
      error: e?.message || 'Failed to update comment status',
    });
    throw e;
  }
};

export const deleteCommentThunk = (commentId) => async (dispatch) => {
  dispatch({ type: 'comments/delete/request', meta: { commentId } });

  try {
    await deleteComment(commentId);
    dispatch({ type: 'comments/delete/success', payload: { commentId } });
  } catch (e) {
    dispatch({
      type: 'comments/delete/failure',
      meta: { commentId },
      error: e?.message || 'Failed to delete comment',
    });

    throw e;
  }
};

export function selectCommentsByParent(state, postId) {
  const { items, postId: shownFor } = state.comments || {};
  if (!Array.isArray(items) || shownFor == null || String(shownFor) !== String(postId)) {
    return [];
  }

  const byParent = new Map();
  const byId = new Map();

  for (const c of items) {
    const node = { ...c, children: [] };
    byId.set(c.id, node);
  }

  for (const c of items) {
    const pid = c.parent_id ?? null;
    if (!byParent.has(pid)) byParent.set(pid, []);
    byParent.get(pid).push(byId.get(c.id));
  }
    
  for (const node of byId.values()) {
    const kids = byParent.get(node.id);
    if (kids) node.children = kids;
  }

  return byParent.get(null) || [];
};