import { req } from '../common/APIUtils';

export const fetchCategories = () => req('/api/categories');

export const updatePost = (postId, { title, content, categories }) =>
  req(`/api/posts/${postId}`, {
    method: 'PATCH',
    body: { title, content, categories },
  });
