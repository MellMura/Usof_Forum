const express = require('express');

const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAdmin, commentController.listAllComments);
router.get('/:comment_id', commentController.getCommentById);
router.patch('/:comment_id', requireAuth, commentController.updateCommentByAuthor);
router.patch('/:comment_id/admin', requireAdmin, commentController.updateCommentByAdmin);
router.delete('/:comment_id', requireAuth, commentController.deleteComment);
router.get('/:comment_id/like', likeController.getCommentReactions);
router.post('/:comment_id/like', requireAuth, likeController.createCommentReaction);
router.delete('/:comment_id/like', requireAuth, likeController.deleteCommentReaction);

module.exports = router;
