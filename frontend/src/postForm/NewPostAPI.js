import { req } from '../common/APIUtils';

export const fetchCategories = () => req('/api/categories');

export const createPost = ({ title, content, categories }) =>
  req('/api/posts', {
    method: 'POST',
    body: { title, content, categories: categories.join(',') },
  });
