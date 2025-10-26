import { listBookmarks, addBookmark, removeBookmark } from '../bookmark/BookmarksAPI';
import { markPostBookmarked } from './postsActions';


export const fetchBookmarks = (params) => async (dispatch) => {
  dispatch({ type: 'bookmarks/fetch/request' });
  try {
    const bookmarks = await listBookmarks(params);
    const items = Array.isArray(bookmarks) ? bookmarks : (bookmarks.items || []);
    dispatch({ type: 'bookmarks/fetch/success', payload: items, meta: { params } });
  } catch (e) {
    dispatch({ type: 'bookmarks/fetch/failure', error: e?.message || 'Failed to load bookmarks' });
  }
};

export const toggleBookmark = (postId, nextSaved) => async (dispatch) => {
  dispatch(markPostBookmarked(postId, nextSaved));
  dispatch({ type: 'bookmarks/toggle/optimistic', payload: { postId, nextSaved } });
  
  try {
    if (nextSaved) await addBookmark(postId);
    else await removeBookmark(postId);

    dispatch({ type: 'bookmarks/toggle/do', payload: { postId, saved: nextSaved } });

    return { ok: true };
  } catch (e) {
    dispatch(markPostBookmarked(postId, !nextSaved));
    dispatch({ type: 'bookmarks/toggle/cancel', payload: { postId } });

    return { ok: false, error: e };
  }
};

export const removeBookmarkOptimistic = (postId) => ({
  type: 'bookmarks/remove/optimistic',
  payload: postId,
});