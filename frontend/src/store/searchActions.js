import { searchUsers } from '../search/SearchAPI'; 

export const searchUsersFetch = ({ q, limit = 20, reset = false } = {}) => async (dispatch, getState) => {
    const st = getState().search?.users || { q: '', items: [], offset: 0, hasMore: true, status: 'idle' };
  
    const reloader = reset || st.q !== q;
    const offset = reloader ? 0 : st.offset;
  
    if (!reloader && (st.status === 'loading' || !st.hasMore)) return;
  
    dispatch({ type: 'search/users/request', payload: { q, reloader } });
  
    try {
      const res = await searchUsers({ search: q, limit, offset });
      const items = Array.isArray(res) ? res : (res.items || []);
      const hasMore = items.length >= Number(limit);
  
      dispatch({
        type: 'search/users/success',
        payload: {
          q,
          items,
          append: !reloader,
          nextOffset: offset + items.length,
          hasMore,
        },
      });
    } catch (e) {
      dispatch({ type: 'search/users/failure', error: e?.message || 'Failed to load users' });
    }
  };