import { listBlockedUsers, blockUser, unblockUser } from '../block/BlocksAPI';

export const fetchBlockedUsers = () => async (dispatch) => {
  dispatch({ type: 'blocks/fetch/request' });
  
  try {
    const data = await listBlockedUsers();
    const items = Array.isArray(data) ? data : [];

    if (Array.isArray(items) && items.length) {
      console.log('first item keys:', Object.keys(items[0]));
      console.log('first item sample:', items[0]);
    }
    
    dispatch({ type: 'blocks/fetch/success', payload: items });
  } catch (e) {
    dispatch({ type: 'blocks/fetch/failure', error: e?.message || 'Failed to load block list' });
  }
};

export const blockUserThunk = (id) => async (dispatch) => {
  dispatch({ type: 'blocks/block/request', payload: id });
  
  try {
    await blockUser(id);

    dispatch(fetchBlockedUsers());
    
  } catch (e) {
    dispatch({ type: 'blocks/block/failure', payload: id, error: e?.message });
  }
};

export const unblockUserThunk = (id) => async (dispatch) => {
  dispatch({ type: 'blocks/unblock/request', payload: id });

  try {
    await unblockUser(id);
    dispatch(fetchBlockedUsers());
  } catch (e) {
    dispatch({ type: 'blocks/unblock/failure', payload: id, error: e?.message });
  }
};

export const selectIsUserBlocked = (state, userId) => {
  const arr = state.blocks?.items || [];
  const uid = Number(userId);
  if (!Number.isFinite(uid)) return false;

  return arr.some((item) => Number(item.target_id ?? item.id ?? item.user_id ?? item.blocked_id) === uid);
};