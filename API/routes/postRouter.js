const express = require('express');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const categoryController = require('../controllers/categoryController');
const likeController = require('../controllers/likeController');
const bookmarkController = require('../controllers/bookmarkController');
const { requireAuth, optionalAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, postController.getAllPosts);
router.get('/:post_id', optionalAuth, postController.getPostById);
router.post('/', requireAuth, postController.createPost);
router.patch('/:post_id', requireAuth, postController.updatePostByAuthor);
router.patch('/:post_id/admin', requireAdmin, postController.updatePostByAdmin);
router.delete('/:post_id', requireAuth, postController.deletePost);

router.get('/:post_id/comments', optionalAuth, commentController.getAllComments);
router.post('/:post_id/comments', requireAuth, commentController.createNewComment);

router.get('/:post_id/categories', postController.getPostCategories);

router.get('/:post_id/like', likeController.getPostReactions);
router.post('/:post_id/like', requireAuth, likeController.createPostReaction);
router.delete('/:post_id/like', requireAuth, likeController.deletePostReaction);

router.post('/:post_id/bookmark',requireAuth, bookmarkController.addBookmark);
router.delete('/:post_id/bookmark',requireAuth, bookmarkController.removeBookmark);

module.exports = router;
