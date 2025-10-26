import { uploadAvatar, deleteUserAvatar, updateUser, getUser, createUser, uploadUserAvatarAdmin, deleteUser } from '../profile/ProfileAPI';
import { listUsers, createUserAdmin } from '../admin/AdminAPI';

const pickEditableFields = (form, { isAdmin }) => {
  const base = ['login', 'full_name', 'email'];
  const adminOnly = ['rating', 'status'];
  const allowed = new Set(isAdmin ? [...base, ...adminOnly] : base);

  const out = {};
  for (const k of Object.keys(form || {})) {
    if (allowed.has(k) && form[k] !== undefined) out[k] = form[k];
  }
  return out;
};

export const updateProfileThunk = ({ userId, formData, isAdmin: isAdminFromUI}) => async (dispatch, getState) => {
  if (!Number.isFinite(Number(userId))) {
    dispatch({ type: 'profile/update/failure', error: 'Invalid user id' });
    return;
  }

  const state = getState();
  const isAdmin = Boolean(isAdminFromUI ?? (state?.auth?.user?.status === 'admin'));

  const body = pickEditableFields(formData, { isAdmin });
  if (Object.keys(body).length === 0) {
    dispatch({ type: 'profile/update/failure', error: 'No editable fields provided' });
    return;
  }

  dispatch({ type: 'profile/update/request', payload: { userId } });

  try {
    const patchResp = await updateUser(userId, body);

    const updatedUser = patchResp?.id ? patchResp : await getUser(userId);

    dispatch({ type: 'profile/update/success', payload: updatedUser });
    return updatedUser;
  } catch (e) {
    dispatch({
      type: 'profile/update/failure',
      error: e?.message || 'Failed to update profile',
      payload: { userId },
    });
    throw e;
  }
};

export const createUserAdminThunk = (form) => async (dispatch) => {
  dispatch({ type: 'admin/user/create/request' });
  try {
    const created = await createUserAdmin(form);
    dispatch({ type: 'admin/user/create/success', payload: created });
    return created;
  } catch (e) {
    dispatch({ type: 'admin/user/create/failure', error: e?.message || 'Failed to create user' });
    throw e;
  }
};

export const uploadAvatarThunk = (file) => async (dispatch, getState) => {
  dispatch({ type: 'profile/update/request' });
  try {
    const updated = await uploadAvatar(file);
    dispatch({ type: 'profile/update/success', payload: updated });
    return updated;
  } catch (e) {
    dispatch({ type: 'profile/update/failure', error: e?.message || 'Failed to upload avatar' });
    throw e;
  }
};

export const createUserWithAvatarThunk = (form, avatarFile) => async (dispatch) => {
  dispatch({ type: 'admin/user/create/request' });

  try {
    const created = await createUser(form);
    dispatch({ type: 'admin/user/create/success', payload: created });

    let updated = created;
    if (avatarFile && created?.id) {
      const u2 = await uploadUserAvatarAdmin(created.id, avatarFile);
      updated = u2?.id ? u2 : created;
      dispatch({ type: 'admin/user/avatar/success', payload: updated });
    }

    return updated;
  } catch (e) {
    dispatch({ type: 'admin/user/create/failure', error: e?.message || 'Failed to create user' });
    throw e;
  }
};

export const deleteAvatarThunk = (userId) => async (dispatch) => {
  dispatch({ type: 'profile/update/request' });
  try {
    await deleteUserAvatar(userId);
    const updated = await getUser(userId);
    dispatch({ type: 'profile/update/success', payload: updated });
    return updated;
  } catch (e) {
    dispatch({ type: 'profile/update/failure', error: e?.message || 'Failed to delete avatar' });
    throw e;
  }
};

export const fetchProfileUser = (userId) => async (dispatch) => {
  if (!Number.isFinite(userId) || userId <= 0) {
    dispatch({ type: 'profile/user/failure', error: 'Invalid user id' });
    return;
  }
  dispatch({ type: 'profile/user/request', payload: { userId } });
  try {
    const user = await getUser(userId);
    dispatch({ type: 'profile/user/success', payload: user });
  } catch (e) {
    dispatch({
      type: 'profile/user/failure',
      error: e?.message || 'Failed to load user',
      payload: { userId },
    });
  }
};

export const fetchAdminUsers = (params = {}) => async (dispatch) => {
  const p = { page: 1, limit: 50, sort: 'id', order: 'desc', ...params };
  dispatch({ type: 'profile/adminUsers/request', payload: { params: p } });
  try {
    const resp = await listUsers(p);
    const items = Array.isArray(resp) ? resp : (resp.items || []);
    dispatch({ type: 'profile/adminUsers/success', payload: { items, params: p } });
  } catch (e) {
    dispatch({ type: 'profile/adminUsers/failure', error: e?.message || 'Failed to load users' });
  }
};

export const createUserThunk = (body) => async (dispatch) => {
  dispatch({ type: 'profile/adminUsers/create/request' });
  try {
    const created = await createUser(body);

    dispatch({ type: 'profile/adminUsers/create/success', payload: created });

    dispatch(fetchAdminUsers());
    return created;
  } catch (e) {
    dispatch({ type: 'profile/adminUsers/create/failure', error: e?.message || 'Failed to create user' });
    throw e;
  }
};

export const deleteUserThunk = (userId) => async (dispatch, getState) => {
  const me = getState()?.auth?.user;
  if (me && Number(me.id) === Number(userId)) {
    throw new Error("You can't delete your own account here.");
  }

dispatch({ type: 'admin/users/delete/request', payload: userId });
  try {
    await deleteUser(userId);

    dispatch({ type: 'admin/users/delete/success', payload: userId });

    return { ok: true };
  } catch (e) {
    dispatch({
      type: 'admin/users/delete/failure',
      payload: userId,
      error: e?.message || 'Failed to delete user',
    });

    return { ok: false, error: e };
  }
};