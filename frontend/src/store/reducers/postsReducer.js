const initialState = { 
  feed: { items: [], status: 'idle', hasMore: false, lastParams: null },
  search: { items: [], status: 'idle', hasMore: false, lastParams: null },
  profile: { status: 'idle', error: null, user: null, items: [] },
  admin:  { items: [], status: 'idle', hasMore: false, lastParams: null },
  byId: {},
};

function makeArray(prev, next) {
  const seen = new Set(prev.map((p) => p.id));
  const add  = next.filter((p) => !seen.has(p.id));
  return prev.concat(add);
}

export function postsReducer(state = initialState, action) {
  switch (action.type) {
    case 'profile/user/request':
      return {
        ...state,
        profile: { ...state.profile, status: 'loading', error: null, user: null, items: [] },
      };
    case 'profile/user/success':
      return {
        ...state,
        profile: { ...state.profile, status: 'ready', user: action.payload, error: null },
      };
    case 'profile/user/failure':
      return {
        ...state,
        profile: { ...state.profile, status: 'error', error: action.error, user: null, items: [] },
      };
    case 'posts/create/request':
      return { ...state, status: 'loading', error: '' };
    case 'posts/create/success': {
      return { ...state, status: 'idle' };
    }
    case 'posts/create/failure':
      return { ...state, status: 'error', error: action.error || 'Failed to create post' };
    case 'posts/update/request':
        return { ...state, status: 'loading', error: '' };
    case 'posts/update/success': {
      return { ...state, status: 'idle' };
    }
    case 'posts/update/failure':
      return { ...state, status: 'error', error: action.error };
    case 'posts/fetch/request': {
      const { place, params } = action.payload;
      return {
        ...state,
        [place]: { ...state[place], status: 'loading', lastParams: params }
      };
    }
    case 'posts/fetch/success': {
      const { place, items, hasMore, append, params } = action.payload;
      const prev = state[place];
      const merged = append ? prev.items.concat(items) : items;

      const byId = { ...state.byId };
      for (const p of merged) if (p?.id != null) byId[p.id] = p;

      return {
        ...state,
        byId,
        [place]: {
          ...prev,
          status: 'idle',
          items: merged,
          hasMore,
          lastParams: params,
        }
      };
    }
    case 'posts/fetch/failure': {
      const { place } = action.payload;
      return {
        ...state,
        [place]: { ...state[place], status: 'error' }
      };
    }
    case 'posts/one/fetch/request':
      return { ...state, status: 'loading', error: '' };
    case 'posts/one/fetch/success': {
      const post = action.payload;
      return {
        ...state,
        status: 'idle',
        byId: { ...state.byId, [post.id]: post },
      };
    }
    case 'posts/one/fetch/failure':
      return { ...state, status: 'error', error: action.error || 'Failed to fetch post' };
    case 'posts/delete/success':
      const id = action.payload;
      return {
        ...state,
        feed: { ...state.feed,   items: state.feed.items.filter(p => p.id !== id) },
        search: { ...state.search, items: state.search.items.filter(p => p.id !== id) },
        admin: { ...state.admin, items: state.admin.items.filter(p => p.id !== id) },
        profile: { ...state.profile, items: state.profile.items.filter(p => p.id !== id) },
      };
    case 'posts/lock/success': {
      const { postId, locked } = action.payload;
      const patch = (arr) => arr.map(p => (p.id === postId ? { ...p, locked } : p));
      return {
        ...state,
        feed: { ...state.feed,   items: patch(state.feed.items) },
        search: { ...state.search, items: patch(state.search.items) },
        admin: { ...state.admin,  items: patch(state.admin.items) },
        profile:{ ...state.profile, items: patch(state.profile.items) },
        byId: { ...state.byId, [postId]: { ...(state.byId[postId] || {}), id: postId, locked } },
      };
    }
    case 'posts/status/success': {
      const { postId, status } = action.payload;
      const patch = (arr = []) => arr.map(p => p.id === postId ? { ...p, status } : p);
    
      return {
        ...state,
        feed: state.feed ? { ...state.feed, items: patch(state.feed.items) } : state.feed,
        search: state.search ? { ...state.search, items: patch(state.search.items) } : state.search,
        profile: state.profile ? { ...state.profile, items: patch(state.profile.items) } : state.profile,
        byId: state.byId ? { ...state.byId, [postId]: { ...(state.byId[postId] || {}), status } } : state.byId,
      };
    }
    case 'posts/bookmark/local': {
      const { postId, saved } = action.payload;
      const patch = (arr = []) => arr.map(p => (p.id === postId ? { ...p, bookmarked: !!saved } : p));
      return {
        ...state,
        feed:   { ...state.feed,   items: patch(state.feed.items) },
        search: { ...state.search, items: patch(state.search.items) },
        admin:  { ...state.admin,  items: patch(state.admin.items) },
        profile:{ ...state.profile, items: patch(state.profile.items) },
        byId:   { ...state.byId, [postId]: { ...(state.byId[postId] || {}), id: postId, bookmarked: !!saved } },
      };
    }
    case 'profile/posts/request':
      return state;
    case 'profile/posts/success':
      const items = action.payload || [];
      const byId = { ...state.byId };
      for (const p of items) if (p?.id != null) byId[p.id] = p;
      return { ...state, profile: { ...state.profile, items }, byId };
    case 'profile/posts/failure':
      return { 
        ...state, 
        profile: { ...state.profile, error: action.error || state.profile.error } 
      };
    default:
      return state;
  }
}
