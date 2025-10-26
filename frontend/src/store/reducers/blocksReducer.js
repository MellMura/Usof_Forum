const initialState = { items: [], status: 'idle', error: ''};
  
export function blocksReducer(state = initialState, action) {
  switch (action.type) {
    case 'blocks/fetch/request':
      return { ...state, status: 'loading', error: '' };
    case 'blocks/fetch/success':
      return { ...state, status: 'idle', items: action.payload };
    case 'blocks/fetch/failure':
      return { ...state, status: 'error', error: action.error || 'Failed to load blocklist' };
    case 'blocks/block/request':
      return {
        ...state,
        items: [...state.items, { target_id: action.payload }],
        status: 'idle',
      };

    case 'blocks/unblock/request':
      return {
        ...state,
        items: state.items.filter(it => Number(it.target_id) !== Number(action.payload)),
        status: 'idle',
      };
    case 'blocks/block/failure':
    case 'blocks/unblock/failure':
      return {
        ...state,
        status: 'idle',
        error: action.error || 'Blocking/unblocking request failed',
      };
    default:
      return state;
  }
}