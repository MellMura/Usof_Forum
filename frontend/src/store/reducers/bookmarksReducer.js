const initialState = { items: [], status: 'idle', error: null, lastParams: {},};

export function bookmarksReducer(state = initialState, action) {
  switch (action.type) {
    case 'bookmarks/fetch/request':
      return { ...state, status: 'loading', error: '' };
    case 'bookmarks/fetch/success':
      return { ...state, status: 'idle', items: action.payload, lastParams: action.meta?.params || {} };
    case 'bookmarks/fetch/failure':
      return { ...state, status: 'error', error: action.error || 'Failed to load bookmarks' };
    case 'bookmarks/toggle/optimistic': {
      const { postId, nextSaved } = action.payload;
      
      if (!nextSaved) {
        return { ...state, items: state.items.filter((p) => p.id !== postId) };
      }

      return state;
    }
    case 'bookmarks/remove/optimistic':
      return { ...state, items: state.items.filter(p => p.id !== action.payload) };
    case 'bookmarks/toggle/cancel': {
      return state;
    }
    case 'bookmarks/toggle/do':
      return state;
    default:
      return state;
  }
}