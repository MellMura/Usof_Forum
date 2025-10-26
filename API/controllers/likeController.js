const Like = require('../models/Like');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

function validateType(type) {
    return type === 'like' || type === 'dislike';
}

exports.createPostReaction = async (req, res) => {
  try {
    const post_id = req.params.post_id;
    const { type = 'like' } = req.body;
    const isAdmin = req.user?.status === 'admin';
    
    if (type !== 'like' && type !== 'dislike') {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const post = await Post.findById(post_id);

    if (!post || (!isAdmin && post.status !== 'active')) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await Like.createForPost({ post_id, user_id: req.user.id, author: req.user.login, type});
    await Like.recountByPostId(post_id);
    const counts = await Like.countForPost(post_id);
    
    
    return res.status(200).json(counts);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to react on post' });
  }
};

exports.createCommentReaction = async (req, res) => {
  try {
    const comment_id = req.params.comment_id;
    const { type = 'like' } = req.body;
    const isAdmin = req.user?.status === 'admin';
      
    if (type !== 'like' && type !== 'dislike') {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }
  
    const comment = await Comment.findById(comment_id);
  
    if (!comment || (!isAdmin && comment.status !== 'active')) {
      return res.status(404).json({ error: 'Comment not found' });
    }
  
    await Like.createForComment({ comment_id, user_id: req.user.id, author: req.user.login, type});
    await Like.recountByCommentId(comment_id);
    const counts = await Like.countForComment(comment_id);
      
    return res.status(200).json(counts);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to react on comment' });
  }
};

exports.getPostReactions = async (req, res) => {
  try {
    const post_id = req.params.post_id;
    const isAdmin = req.user?.status === 'admin';
    const post = await Post.findById(post_id);

    if (!post || (!isAdmin && post.status !== 'active')) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const [items, summary] = await Promise.all([
      Like.findAllForPost(post_id),
      Like.countForPost(post_id)
    ]);

    return res.json({ summary, items });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch post likes' });
  }
};

exports.getCommentReactions = async (req, res) => {
  try {
    const comment_id = req.params.comment_id;
    const isAdmin = req.user?.status === 'admin';
    const comment = await Comment.findById(comment_id);
  
    if (!comment || (!isAdmin && comment.status !== 'active')) {
      return res.status(404).json({ error: 'Comment not found' });
    }
  
    const [items, summary] = await Promise.all([
      Like.findAllForComment(comment_id),
      Like.countForComment(comment_id)
    ]);
    
    return res.json({ summary, items });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch comment likes' });
  }
};

exports.deletePostReaction = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(400).json({ error: 'Not authenticated' });
    const post_id = req.params.post_id;
    const targetUserId = (req.user.status === 'admin' && req.body?.user_id)
    ? Number(req.body.user_id)
    : req.user.id;

    const del = await Like.removeForPost({
      post_id: req.params.post_id,
      user_id: targetUserId,
    });
    await Like.recountByPostId(post_id);
    
    if (!del) return res.status(404).json({ error: 'Reaction not found' });
    return res.status(200).end();
  } catch (e) {
    return res.status(500).json({ error: 'Failed to delete post like'} );
  }
};

exports.deleteCommentReaction = async (req, res) => {
    try {
      if (!req.user?.id) return res.status(400).json({ error: 'Not authenticated' });

      const comment_id = req.params.comment_id;
      const targetUserId = (req.user.status === 'admin' && req.body?.user_id)
      ? Number(req.body.user_id)
      : req.user.id;

      const del = await Like.removeForComment({
        comment_id: req.params.comment_id,
        user_id: targetUserId,
      });
      await Like.recountByCommentId(comment_id);
      
      if (!del) return res.status(404).json({ error: 'Reaction not found' });
      return res.status(200).end();
    } catch (e) {
      return res.status(500).json({ error: 'Failed to delete comment like'} );
    }
  };
