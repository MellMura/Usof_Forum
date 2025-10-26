const initialState = { items: [], status: 'idle', error: null,
  creating: false,
  createError: null,
  updating: false,
  updateError: null,
  deleting: false,
  deleteError: null,
 };

export function categoriesReducer(state = initialState, action) {
  switch (action.type) {
    case 'categories/fetch/request':
      return { ...state, status: 'loading', error: null };
    case 'categories/fetch/success':
      return { ...state, status: 'idle', items: action.payload, error: null };
    case 'categories/fetch/failure':
      return { ...state, status: 'error', error: action.error };
    case 'categories/create/request':
      return { ...state, creating: true, createError: null };
    case 'categories/create/success':
      return { ...state, creating: false, createError: null };
    case 'categories/create/failure':
      return { ...state, creating: false, createError: action.error };
    case 'categories/update/request':
      return { ...state, updating: true, updateError: null };
    case 'categories/update/success': {
      const updated = action.payload;
      const items = Array.isArray(state.items)
        ? state.items.map((c) => (Number(c.id) === Number(updated.id) ? { ...c, ...updated } : c))
        : state.items;
      return { ...state, updating: false, items, updateError: null };
    }
    case 'categories/update/failure':
      return { ...state, updating: false, updateError: action.error };
    case 'categories/delete/request':
      return { ...state, deleting: true, deleteError: null };
    case 'categories/delete/success': {
      const id = action.payload;
      const items = Array.isArray(state.items)
        ? state.items.filter((c) => Number(c.id) !== Number(id))
        : state.items;
      return { ...state, deleting: false, items, deleteError: null };
    }
    case 'categories/delete/failure':
      return { ...state, deleting: false, deleteError: action.error };

    default:
      return state;
  }
}