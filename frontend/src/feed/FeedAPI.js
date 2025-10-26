import { req, qs } from '../common/APIUtils';

export const listPosts = async (params = {}) => req(`/api/posts${qs(params)}`);

export const getPostCategories = (postId) =>
    req(`/api/posts/${postId}/categories`);

export default { listPosts };
