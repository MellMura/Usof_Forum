import { req } from '../common/APIUtils';

export async function searchUsers({ search = '', limit = 20, offset = 0 }) {
  return req(
    `/api/users?search=${encodeURIComponent(search)}&limit=${Number(limit)}&offset=${Number(offset)}`
  );
}