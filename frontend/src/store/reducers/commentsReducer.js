const initialState = { postId: null, items: [], status: 'idle', error: null, updatingById: {},
admin: { items: [], status: 'idle', error: null, lastParams: null },};

export function commentsReducer(state = initialState, action) {
  switch (action.type) {
    case 'comments/admin/fetch/request':
      return { ...state, admin: { ...state.admin, status: 'loading', error: null, lastParams: action.payload.params } };
    case 'comments/admin/fetch/success':
      return { ...state, admin: { ...state.admin, status: 'idle', error: null, items: action.payload.items, lastParams: action.payload.params } };
    case 'comments/admin/fetch/failure':
      return { ...state, admin: { ...state.admin, status: 'error', error: action.error } };
    case 'comments/fetch/request':
      return { ...state, status: 'loading', error: null, postId: action.meta?.postId ?? null };
    case 'comments/fetch/success':
      return {
        ...state,
        status: 'idle',
        error: null,
        postId: action.payload?.postId ?? state.postId,
        items: Array.isArray(action.payload?.items) ? action.payload.items : [],
      };
    case 'comments/fetch/failure':
      return { ...state, status: 'error', error: action.error || 'Failed to load comments' };
    case 'comments/create/request':
      return { ...state, status: 'posting', error: null };
    case 'comments/create/success': {
      const item = action.payload?.item;

      if (!item || String(item.post_id) !== String(state.postId)) {
        return { ...state, status: 'idle' };
      }

      return { ...state, status: 'idle', items: [item, ...state.items], };
    }
    case 'comments/create/failure':
      return { ...state, status: 'idle', error: action.error || 'Failed to create a comment' };
    case 'comments/update/request': {
      const id = action.meta?.commentId;
      return {
        ...state,
        updatingById: { ...state.updatingById, [id]: true },
      };
    }
    case 'comments/update/success': {
      const updated = action.payload;
      const id = updated?.id;
      return {
        ...state,
        items: id
          ? state.items.map((c) => (String(c.id) === String(id) ? { ...c, ...updated } : c))
          : state.items,
        updatingById: id
          ? Object.fromEntries(Object.entries(state.updatingById).filter(([k]) => String(k) !== String(id)))
          : state.updatingById,
      };
    }
    case 'comments/update/failure': {
      const id = action.meta?.commentId;
      const { [id]: _, ...rest } = state.updatingById;
      return {
        ...state,
        updatingById: rest,
        error: action.error || state.error,
      };
    }
    case 'comments/lock/request': {
      const id = action.meta?.commentId;
      return {
        ...state,
        updatingById: { ...state.updatingById, [id]: true },
      };
    }
    case 'comments/lock/success': {
      const updated = action.payload;
      const id = updated?.id;
      return {
        ...state,
        items: id
          ? state.items.map((c) => (String(c.id) === String(id) ? { ...c, ...updated } : c))
          : state.items,
        updatingById: id
          ? Object.fromEntries(Object.entries(state.updatingById).filter(([k]) => String(k) !== String(id)))
          : state.updatingById,
      };
    }
    case 'comments/lock/failure': {
      const id = action.meta?.commentId;
      const { [id]: _, ...rest } = state.updatingById;
      return {
        ...state,
        updatingById: rest,
        error: action.error || state.error,
      };
    }
    case 'comments/delete/request': {
      const id = action.meta?.commentId;
      return {
        ...state,
        updatingById: { ...state.updatingById, [id]: true },
      };
    }
    case 'comments/delete/success': {
      const id = action.payload?.commentId;
      const { [id]: _, ...rest } = state.updatingById;
      return {
        ...state,
        items: id != null
          ? state.items.filter((c) => String(c.id) !== String(id))
          : state.items,
        updatingById: rest,
      };
    }
    case 'comments/delete/failure': {
      const id = action.meta?.commentId;
      const { [id]: _, ...rest } = state.updatingById;
      return {
        ...state,
        updatingById: rest,
        error: action.error || state.error,
      };
    }
    default:
      return state;
  }
}
