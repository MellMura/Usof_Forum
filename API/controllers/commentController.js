const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Block = require('../models/Block');
const User = require('../models/User');
const Like = require('../models/Like');

function parseLocked(v) {
  if (v === true || v === 1) return 1;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === '1' || s === 'true' || s === 'on') return 1;
  }
  return 0;
}

exports.listAllComments = async (req, res) => {
  try {
    const isAdmin = req.user?.status === 'admin';
    const viewerId = req.user?.id || null;

    const page  = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const offset = (page - 1) * limit;

    const sort  = String(req.query.sort  || 'date').toLowerCase();
    const order = String(req.query.order || 'desc').toLowerCase();
    const helper = order === 'asc' ? 1 : -1;

    const postId   = req.query.post_id   ? Number(req.query.post_id)   : null;
    const authorId = req.query.author_id ? Number(req.query.author_id) : null;
    const status   = req.query.status ? String(req.query.status) : null;

    const rows = await Comment.findMany({
      includeInactive: isAdmin,
      post_id: postId,
      author_id: authorId,
      status: isAdmin ? status : 'active',
      offset,
      limit,

      sqlSort: sort === 'date' ? 'date' : 'id',
      sqlOrder: order,
    }) || [];

    let filtered = rows;
    if (!isAdmin && viewerId) {
      const blockedMe = new Set(await Block.listBlockers(viewerId));
      const iBlocked  = new Set(await Block.getBlockedUsers(viewerId));
      filtered = rows.filter(c => {
        const uid = Number(c.author_id);
        if (!uid) return true;
        if (uid === viewerId) return true;
        if (iBlocked.has(uid))  return false;
        if (blockedMe.has(uid)) return false;
        return true;
      });
    }

    if (!filtered.length) return res.json([]);

    const ids = filtered.map(c => c.id);
    const counts = await Like.countForMultipleComments(ids);

    const withCounts = filtered.map(c => {
      const k = counts[c.id] || { like: 0, dislike: 0 };
      const likes    = Number(k.like || 0);
      const dislikes = Number(k.dislike || 0);
      const score    = likes - dislikes;
      return { ...c, likes, dislikes, score };
    });

    if (sort === 'likes') {
      withCounts.sort((a, b) => {
        const byLikes = (a.likes - b.likes) * helper;
        if (byLikes !== 0) return -byLikes;
        const byDate = (new Date(a.created_at) - new Date(b.created_at)) * helper;
        if (byDate !== 0) return -byDate;
        return (a.id - b.id) * helper * -1;
      });
    }

    return res.json(withCounts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const postId = Number(req.params.post_id);
    //admins can see all comments, even inactive ones and normal users only see active
    const isAdmin = req.user?.status === 'admin';
    const viewerId = req.user?.id || null;
    
    const sort  = String(req.query.sort  || 'likes').toLowerCase();
    const order = String(req.query.order || 'asc').toLowerCase();
    const helper = order === 'asc' ? 1 : -1;

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({ error: 'Invalid post id' });
    }
    
    const post = await Post.findById(postId);

    if (!post || (!isAdmin && post.status !== 'active')) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const rows = isAdmin
      ? (await Comment.findByPost(postId)) || []
      : (await Comment.findActiveForPost(postId)) || [];

    if (!rows.length) {
      return res.json([]);
    }
    
    let filtered = rows;
    if (viewerId) {
      //doesn't show comments of users who i blocked or who blocked me
      const blockedMe = new Set(await Block.listBlockers(viewerId));
      const iBlocked  = new Set(await Block.getBlockedUsers(viewerId));

      filtered = rows.filter(c => {
        const uid = Number(c.author_id);
        if (!uid) return true;
        if (uid === viewerId) return true;
        if (iBlocked.has(uid))  return false;
        if (blockedMe.has(uid)) return false;
        return true;
      });
    }

    if (!filtered.length) {
      return res.json([]);
    }

    const ids    = filtered.map(c => c.id);
    const counts = await Like.countForMultipleComments(ids);

    const withCounts = filtered.map(c => {
      const k = counts[c.id] || { like: 0, dislike: 0 };
      const likes    = Number(k.like || 0);
      const dislikes = Number(k.dislike || 0);
      const score    = likes - dislikes;
      return { ...c, likes, dislikes, score };
    });

    withCounts.sort((a, b) => {
      if (sort === 'date') {
        return (new Date(a.created_at) - new Date(b.created_at)) * helper;
      }

      const byLikes = (a.likes - b.likes) * helper;

      if (byLikes !== 0) return byLikes;

      const byDate = (new Date(a.created_at) - new Date(b.created_at)) * helper;

      if (byDate !== 0) return byDate;

      return (a.id - b.id) * helper;
    });

    return res.json(withCounts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

exports.getCommentById = async (req, res) => {
  try{
    const comment_id = req.params.comment_id;
    const isAdmin = req.user?.status === 'admin';
    const viewerId = req.user?.id || null;
    const comment = await Comment.findById(comment_id);
      
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
  
    //only admins can see an inactive comments or comments under inactive posts by id 
    const parentPost = await Post.findById(comment.post_id);
    if (!parentPost || (!isAdmin && (parentPost.status !== 'active' || comment.status !== 'active'))) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    //filter out the comments of blocked users
    if (!isAdmin && viewerId && comment.author_id !== viewerId) {
      const blocked = await Block.isBlockedEither(viewerId, comment.author_id);
      if (blocked) return res.status(404).json({ error: 'Comment not found' });
    }
  
    res.json(comment);
  } catch {
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
};

exports.createNewComment = async (req, res) => {
  try {
    const post_id = req.params.post_id;
    const { content, status, locked, parent_id: parentComm } = req.body || {};
    const parent_id = parentComm != null ? Number(parentComm) : null;
    const isAdmin = req.user?.status === 'admin';
    const author_id = req.user?.id;

    if (!author_id || !content) {
      return res.status(400).json({ error: 'Missing author or content' });
    }
    if (content.length > 5000) {
      return res.status(400).json({ error: 'Content of the comment is too long' });
    }
    
    const post = await Post.findById(post_id);

    if (!post || (!isAdmin && post.status !== 'active')) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (Number(post.locked) === 1 || post.locked === true) {
      return res.status(400).json({ error: 'Post is locked. New comments are not allowed.' });
    }

    if (parent_id != null) {
      if(!Number.isInteger(parent_id) || parent_id <= 0) {
        return res.status(400).json({ error: 'Invalid parent id' });
      }
      
      const parent = await Comment.findById(parent_id);
      if (!parent) return res.status(404).json({ error: 'Parent comment not found or doesn\'t exist' });

      if (!isAdmin && parent.status !== 'active') {
        return res.status(404).json({ error: 'Parent comment not available' });
      }
      if (Number(parent.locked) === 1) {
        return res.status(400).json({ error: 'Parent comment is locked. Replies are not allowed.' });
      }
    }

    //no need to restrict commenting on blocked posts, because users won't be able to see them on the front anyway??

    const id = await Comment.create({ post_id, parent_id, author_id, content, status: 'active', locked });
    const created = await Comment.findById(id);
    res.status(200).json(created);
  } catch (e){
    console.error(e);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

exports.updateCommentByAuthor = async (req, res) => {
  try {
    const comment_id = req.params.comment_id;
    const me = req.user?.id;
    if (!me) return res.status(400).json({ error: 'Not authenticated' });

    if ('status' in (req.body || {})) {
      return res.status(400).json({ error: 'Not enough rights to change status' });
    }

    const body = req.body || {};
    const wantContent = Object.prototype.hasOwnProperty.call(body, 'content');
    const wantLocked = Object.prototype.hasOwnProperty.call(body, 'locked');
    if (!wantContent && !wantLocked) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const comment = await Comment.findById(comment_id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (comment.author_id !== me) {
      return res.status(400).json({ error: 'Not enough rights to edit this comment' });
    }


    const parentPost = await Post.findById(comment.post_id);
    if (!parentPost || parentPost.status !== 'active') {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (Number(parentPost.locked) === 1 || parentPost.locked === true) {
      return res.status(423).json({ error: 'Post is locked. Editing comments is not allowed.' });
    }

    if (wantLocked) {
      const incoming = parseLocked(body.locked);
      const isLockedNow = Number(comment.locked) === 1;
      if (isLockedNow) {
        if(incoming === 1) {
          return res.status(400).json({error: 'Comment is already locked'});
        }
        
        if(wantContent) {
          return res.status(400).json({ error: 'Unlock first, then edit content in a separate request' });
        }

        await Comment.setLocked(comment_id, 0);
        const unlocked = await Comment.findById(comment_id);
        return res.status(200).json(unlocked);
      } else {
        await Comment.setLocked(comment_id, incoming);
      }
    }

    if (wantContent) {
      const text = String(body.content).trim();
      if (!text) return res.status(400).json({ error: 'Content cannot be empty' });
      if (text.length > 5000) return res.status(400).json({ error: 'Content is too long' });

      const fresh = await Comment.findById(comment_id);
      
      if (Number(fresh.locked) === 1) {
        return res.status(400).json({ error: 'Comment is locked.' });
      }

      await Comment.updateContent(comment_id, text);
    }
    const updated = await Comment.findById(comment_id);

    return res.status(200).json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to update comment' });
  }
};

exports.updateCommentByAdmin = async (req, res) => {
  try {
    const comment_id = req.params.comment_id;
    const isAdmin = req.user?.status === 'admin';
    if (!isAdmin) return res.status(400).json({ error: 'This action is admin only' });

    const comment = await Comment.findById(comment_id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if ('content' in (req.body || {}) || 'author' in (req.body || {})) {
      return res.status(400).json({ error: 'Only status and locked can be changed here' });
    }

    const { status, locked } = req.body || {};
    let touched = false;

    if (status !== undefined) {
      if (!['active', 'inactive'].includes(String(status))) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const changed = await Comment.updateStatus(comment_id, status);
      if (!changed) return res.status(404).json({ error: 'Comment not found' });
      touched = true;
    }

    if (locked !== undefined) {
      const lockedVal = parseLocked(locked);
      await Comment.setLocked(comment_id, lockedVal);
      touched = true;
    }

    if (!touched) return res.status(400).json({ error: 'Nothing to update' });

    const updated = await Comment.findById(comment_id);
    return res.status(200).json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to update comment as an admin' });
  }
};


exports.deleteComment = async (req, res) => {
  try {
    const me = req.user?.id;
    const isAdmin = req.user?.status === 'admin';
    if (!me) return res.status(401).json({ error: 'Not authenticated' });

    const commentId = req.params.comment_id;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (!isAdmin) {
      const post = await Post.findById(comment.post_id);
      const isCommentAuthor = comment.author_id === me;
      const isPostAuthor    = post?.author_id === me;

      if (!isCommentAuthor && !isPostAuthor) {
        return res.status(403).json({ error: 'Not enough rights to delete this comment' });
      }
    }

    const del = await Comment.deleteById(commentId);
    if (!del) return res.status(404).json({ error: 'Comment not found' });

    return res.status(200).end();
  } catch (e) {
    console.error('[deleteComment] error:', e);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
};

