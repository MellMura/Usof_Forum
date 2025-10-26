import { req } from '../common/APIUtils';

export async function listBookmarks() {
  return req(`/api/bookmarks`);
}
export async function addBookmark(postId) {
    const r = await req(`/api/posts/${postId}/bookmark`, { method: 'POST' });
    console.log('addBookmark → OK', postId, r);
    return r;
  }
  export async function removeBookmark(postId) {
    const r = await req(`/api/posts/${postId}/bookmark`, { method: 'DELETE' });
    console.log('removeBookmark → OK', postId, r);
    return r;
  }
