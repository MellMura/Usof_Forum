const Bookmark = require('../models/Bookmark');
const Post = require('../models/Post');

exports.addBookmark = async (req, res) => {
  try {
    const postId = Number(req.params.post_id);
    const userId = req.user?.id;
    const login = req.user?.login;
    const isAdmin = req.user?.status === 'admin';
  
    if (!Number.isInteger(postId) || postId <= 0) return res.status(400).json({ error: 'Invalid post id' });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (!userId || !login) return res.status(400).json({ error: 'Not authenticated' });

    if (!isAdmin && post.status !== 'active') return res.status(404).json({ error: 'Post not found' });
  
    await Bookmark.create({ post_id: postId, user_id: userId, author: login });
    res.status(200).json({ bookmarked: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to bookmark post' });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const postId = Number(req.params.post_id);
    const userId = req.user?.id;

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({ error: 'Invalid post id' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'Not authenticated' });
    }

    await Bookmark.remove({ post_id: postId, user_id: userId });

    return res.status(200).json({ bookmarked: false });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to remove bookmark' });
  }
};
exports.getByUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.status === 'admin';

    if (!userId) return res.status(400).json({ error: 'Not authenticated' });
  
    const rows = await Bookmark.findForUser(userId, { includeInactive: !!isAdmin });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

exports.getMyBookmarks = async (req, res) => {
  try {
    const me = req.user?.id;
    const isAdmin = req.user?.status === 'admin';
    if (!me) return res.status(401).json({ error: 'Not authenticated' });

    const rows = await Bookmark.findForUser(me, { includeInactive: !!isAdmin });
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};
  