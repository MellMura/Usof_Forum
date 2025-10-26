import { req } from '../common/APIUtils';

export async function getPost(postId) {
  return req(`/api/posts/${postId}`);
}

export async function getPostComments(postId) {
  return req(`/api/posts/${postId}/comments`);
}

export async function getPostCategories(postId) {
  return req(`/api/posts/${postId}/categories`);
}

export async function updatePost (postId, body) {
  return req(`/api/posts/${postId}`, { method: 'PATCH', body });
}

export async function updatePostAdmin (postId, body) {
  return req(`/api/posts/${postId}/admin`, { method: 'PATCH', body });
}

export async function deletePost(postId) {
  return req(`/api/posts/${postId}`, { method: 'DELETE' });
}