const initialProfileState = {
  status: 'idle',
  error: null,
  user: null,
  posts: [],
  updating: false,
  updateError: null,
  usersList: {
    items: [],
    status: 'idle',
    error: null,
    creating: false,
    createError: null,
    lastParams: null,
  },
};

export function profileReducer(state = initialProfileState, action) {
 switch (action.type) {
    case 'profile/user/request':
      return { ...state, status: 'loading', error: null, user: null, posts: [] };
    case 'profile/user/success':
      return { ...state, status: 'ready', user: action.payload, error: null };
    case 'profile/user/failure':
      return { ...state, status: 'error', error: action.error, user: null, posts: [] };
    case 'profile/posts/request':
      return state;
    case 'profile/posts/success':
      return { ...state, posts: action.payload || [] };
    case 'profile/posts/failure':
      return { ...state, error: action.error || state.error };
    case 'profile/update/request':
      return { ...state, updating: true, updateError: null }
    case 'profile/update/success':
      return { ...state, updating: false, user: state.user ? { ...state.user, ...action.payload } : action.payload,};
    case 'profile/update/failure':
      return { ...state, updating: false, updateError: action.error || 'Failed to update profile' };
    case 'profile/reset':
      return initialProfileState;
    case 'profile/adminUsers/request':
      return {
        ...state,
        usersList: {
          ...state.usersList,
          status: 'loading',
          error: null,
          lastParams: action.payload?.params || null,
        },
      };
    case 'profile/adminUsers/success': {
      const items = action.payload?.items || [];
      const sorted = [...items].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
      return {
        ...state,
        usersList: {
          ...state.usersList,
          status: 'ready',
          error: null,
          items: sorted,
          lastParams: action.payload?.params || state.usersList.lastParams,
        },
      };
    }
    case 'profile/adminUsers/failure':
      return {
        ...state,
        usersList: { ...state.usersList, status: 'error', error: action.error },
      };
    case 'profile/adminUsers/create/request':
      return {
        ...state,
        usersList: { ...state.usersList, creating: true, createError: null },
      };
    case 'profile/adminUsers/create/success': {
      const created = action.payload;
      const items = [created, ...state.usersList.items].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
      return {
        ...state,
        usersList: { ...state.usersList, creating: false, items },
      };
    }
    case 'profile/adminUsers/create/failure':
      return {
        ...state,
        usersList: { ...state.usersList, creating: false, createError: action.error },
      };
    default:
      return state;
  }

}
