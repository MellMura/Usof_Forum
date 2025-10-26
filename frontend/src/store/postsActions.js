import { listPosts, getPostCategories } from '../feed/FeedAPI';
import { getPost, deletePost, updatePost, updatePostAdmin } from '../post/PostAPI';
import { listBookmarks } from '../bookmark/BookmarksAPI';
import { getToken } from '../common/APIUtils';
import { createPost } from '../postForm/NewPostAPI';
import { getUserPosts } from '../profile/ProfileAPI';

export const markPostBookmarked = (postId, saved) => ({
  type: 'posts/bookmark/local',
  payload: { postId, saved },
});

export const fetchProfilePosts = (userId) => async (dispatch) => {
  if (!Number.isFinite(userId) || userId <= 0) return;
  dispatch({ type: 'profile/posts/request', payload: { userId } });

  try {
    const items = await getUserPosts(userId);
    dispatch({ type: 'profile/posts/success', payload: items });
  } catch (e) {
    dispatch({
      type: 'profile/posts/failure',
      error: e?.message || 'Failed to load user posts',
      payload: { userId },
    });
  }
};

export const createPostThunk = ({ title, content, categories }) => async (dispatch) => {
  dispatch({ type: 'posts/create/request' });
  try {
    const cats = Array.isArray(categories) ? categories : Array.from(categories || []);
    const created = await createPost({ title, content, categories: cats });

    await dispatch(refetchPosts());

    return created;
  } catch (e) {
    dispatch({
      type: 'posts/create/failure',
      error: e?.message || 'Failed to create post',
    });

    throw e;
  }
};

export const updatePostThunk = (postId, { title, content, categories }) => async (dispatch) => {
  dispatch({ type: 'posts/update/request', payload: { postId } });
  try {
    let cats =
      Array.isArray(categories) ? categories : (categories instanceof Set ? Array.from(categories) : []);
    
    const body = {
      title,
      content,
      categories: cats.join(','),
    };

    const post2 = await updatePost(postId, body);

    dispatch({
      type: 'posts/update/success',
      payload: { id: postId, title, content, categories: cats },
    });

    await dispatch(refetchPosts());
    await dispatch(fetchPostById(postId));
    return post2;
  } catch (e) {
    dispatch({
      type: 'posts/update/failure',
      payload: { postId },
      error: e?.message || 'Failed to update post',
    });

    throw e;
  }
};

export const fetchPosts = (params, { append = false, place = 'feed' } = {}) => async (dispatch, getState) => {
  dispatch({ type: 'posts/fetch/request', payload: { params, place } });

  try {
    const posts = await listPosts(params);
    const arr = Array.isArray(posts) ? posts : (posts.items || []);

    const byId = getState()?.posts?.byId || {};

    let bookmarks = null;
    try {
      if (getToken()) {
        const bm = await listBookmarks();
        const bmArr = Array.isArray(bm) ? bm : (bm.items || []);
        bookmarks = new Set(bmArr.map(p => p.id ?? p.post_id));
      }
    } catch {}

    const normalizeCounts = (p) => ({
      ...p,
      comments: Number(p.comments ?? 0),
      likes: Number(p.likes ?? 0),
      dislikes: Number(p.dislikes ?? 0),
    });

    const items = arr.map((p) => {
      const bookmarked = bookmarks ? bookmarks.has(p.id) : (p.bookmarked ?? false);
      const known = byId[p.id] || {};
      const hasCats = Array.isArray(p.categories) && p.categories.length > 0;
      const categories = hasCats ? p.categories : (Array.isArray(known.categories) ? known.categories : []);
      const status = p.status ?? known.status;
      return {
        ...normalizeCounts(p),
        categories: Array.isArray(p.categories) ? p.categories : [],
        categories,
        status,
        bookmarked,
      };
    });

    const limit = Number(params?.limit) || 10;
    const hasMore = items.length >= limit;

    dispatch({
      type: 'posts/fetch/success',
      payload: { items, params, hasMore, append, place },
    });
  } catch (err) {
    dispatch({
      type: 'posts/fetch/failure',
      error: err?.message || 'Failed to fetch posts',
      payload: { params, place },
    });
  }
};

export const fetchPostById = (postId) => async (dispatch) => {
  dispatch({ type: 'posts/one/fetch/request', payload: { postId } });

  try {
    const post = await getPost(postId);

    let categories = [];
    try {
      const cats = await getPostCategories(postId);
      const list = Array.isArray(cats) ? cats : (cats?.items || []);
      categories = list.map((c) => c.name ?? c.title ?? String(c.id));
    } catch { categories = []; }

    let bookmarked = post.bookmarked ?? false;

    try {
      if (getToken()) {
        const bm = await listBookmarks();
        const arr = Array.isArray(bm) ? bm : (bm?.items || []);
        const ids = arr.map((it) => it.id ?? it.post_id);
        bookmarked = ids.includes(post.id);
      }
    } catch {}

    const withCats = { ...post, categories, bookmarked };

    dispatch({ type: 'posts/one/fetch/success', payload: withCats });
  } catch (e) {
    dispatch({
      type: 'posts/one/fetch/failure',
      payload: { postId },
      error: e?.message || 'Failed to fetch post',
    });
  }
};

export const refetchPosts = (place = 'feed') => (dispatch, getState) => {
  const params = getState()?.posts?.[place]?.lastParams || {};

  return dispatch(fetchPosts(params, { place, append: false }));
};

export const deletePostThunk = (postId) => async (dispatch) => {
  try {
    await deletePost(postId);
    dispatch({ type: 'posts/delete/success', payload: postId });

    await dispatch(refetchPosts());
  } catch (err) {
    dispatch({
      type: 'posts/delete/failure',
      error: err?.message || 'Failed to delete post',
    });

    throw err;
  }
};

export const toggleStatusThunk = (postId, status) => async (dispatch) => {
  try {
    await updatePostAdmin(postId, { status });

    dispatch({
      type: 'posts/status/success',
      payload: { postId, status },
    });

    await dispatch(refetchPosts());
    await dispatch(fetchPostById(postId));
  } catch (err) {
    dispatch({
      type: 'posts/status/failure',
      error: err?.message || 'Failed to update post status',
      payload: { postId, status },
    });
    throw err;
  }
};

export const toggleLockAdminThunk = (postId, locked) => async (dispatch) => {
  try {
    await updatePostAdmin(postId, { locked });
    dispatch({
      type: 'posts/lock/success',
      payload: { postId, locked: Number(locked) },
    });
    await dispatch(refetchPosts());
    await dispatch(fetchPostById(postId));
  } catch (err) {
    dispatch({
      type: 'posts/lock/failure',
      error: err?.message || 'Failed to update lock (admin)',
    });
    throw err;
  }
};

export const toggleLockThunk = (postId, locked) => async (dispatch) => {
  try {
    await updatePost(postId, { locked });
    
    dispatch({
      type: 'posts/lock/success',
      payload: { postId, locked: Number(locked) },
    });

    await dispatch(refetchPosts());
    await dispatch(fetchPostById(postId));
  } catch (err) {
    dispatch({
      type: 'posts/lock/failure',
      error: err?.message || 'Failed to update lock',
    });
    
    throw err;
  }
};