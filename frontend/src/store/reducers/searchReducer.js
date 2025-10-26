const initial = {
  users: { q: '', items: [], status: 'idle', offset: 0, hasMore: false, error: null },
};

export function searchReducer(state = initial, action) {
  switch (action.type) {
    case 'search/users/request': {
      const { q, reloader } = action.payload;
      if (reloader) {
        return { ...state, users: { q, items: [], status: 'loading', offset: 0, hasMore: false, error: null } };
      }
      return { ...state, users: { ...state.users, q, status: 'loading', error: null } };
    }
    case 'search/users/success': {
      const { q, items, append, nextOffset, hasMore } = action.payload;
      const prev = state.users.items;
      return {
        ...state,
        users: {
          q,
          status: 'idle',
          items: append ? prev.concat(items) : items,
          offset: nextOffset,
          hasMore,
          error: null,
        },
      };
    }
    case 'search/users/failure':
      return { ...state, users: { ...state.users, status: 'error', error: action.error } };
    default:
      return state;
  }
}
