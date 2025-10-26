import { fetchCategories } from '../postForm/NewPostAPI';
import { createCategory, updateCategory, deleteCategory } from '../categories/CategoriesAPI';

export const loadCategories = () => async (dispatch, getState) => {
  const { status } = getState().categories || {};
  if (status === 'loading') return;

  dispatch({ type: 'categories/fetch/request' });

  try {
    const list = await fetchCategories();
    const items = Array.isArray(list) ? list : (list.items || []);

    dispatch({ type: 'categories/fetch/success', payload: items });
  } catch (e) {
    dispatch({
      type: 'categories/fetch/failure',
      error: e?.message || 'Failed to load categories',
    });

    throw e;
  }
};

export const updateCategoryThunk = (id, body) => async (dispatch) => {
  dispatch({ type: 'categories/update/request', payload: id });
  try {
    const updated = await updateCategory(id, body);
    dispatch({ type: 'categories/update/success', payload: updated });
    await dispatch(loadCategories());
    return updated;
  } catch (e) {
    dispatch({
      type: 'categories/update/failure',
      payload: id,
      error: e?.message || 'Failed to update category',
    });
    throw e;
  }
};

export const deleteCategoryThunk = (id) => async (dispatch) => {
  dispatch({ type: 'categories/delete/request', payload: id });
  try {
    await deleteCategory(id);
    dispatch({ type: 'categories/delete/success', payload: id });
    await dispatch(loadCategories());
    return true;
  } catch (e) {
    dispatch({
      type: 'categories/delete/failure',
      payload: id,
      error: e?.message || 'Failed to delete category',
    });
    throw e;
  }
};

export const createCategoryThunk = (body) => async (dispatch) => {
  dispatch({ type: 'categories/create/request' });
  
  try {
    const created = await createCategory(body);
    dispatch({ type: 'categories/create/success', payload: created });

    await dispatch(loadCategories());

    return created;
  } catch (e) {
    dispatch({
      type: 'categories/create/failure',
      error: e?.message || 'Failed to create category',
    });
    throw e;
  }
};