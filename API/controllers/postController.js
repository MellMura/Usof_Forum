const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const Block = require('../models/Block');
const User = require('../models/User');

function normalizeCategories(cats) {
  if (cats == null) return [];
  let arr = Array.isArray(cats) ? cats : [cats];

  if (arr.length === 1 && typeof arr[0] === 'string' && arr[0].includes(',')) {
    arr = arr[0].split(',');
  }

  return [...new Set(arr.map(s => String(s).trim()).filter(Boolean))];
}


async function resolveCategoryTokens(tokens, Category) {
  const ids = [];
  const missing = [];

  for (const t of tokens) {
    if (/^\d+$/.test(t)) { ids.push(Number(t)); continue; }
    const cat = await Category.findByName(t);
    if (cat) ids.push(cat.id); else missing.push(t);
  }

  return { ids, missing };
}

function parseLocked(v) {
  if (v === true || v === 1) return 1;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === '1' || s === 'true' || s === 'on') return 1;
  }
  return 0;
}

exports.getAllPosts = async (req, res) => {
  try {
    /*if (!req.user) {
      return res.status(400).json({ error: 'Not authenticated' });
    }*/

    const isAdmin  = req.user?.status === 'admin';
    const viewerId = req.user?.id || null;
  
    const sort  = String(req.query.sort  || 'likes').toLowerCase();
    const order = String(req.query.order || 'desc').toLowerCase();

    const q = (req.query.q ?? req.query.search ?? '').trim();

    const status   = isAdmin ? (req.query.status || undefined) : undefined;
    const dateFrom = req.query.date_from || req.query.from || undefined;
    const dateTo   = req.query.date_to   || req.query.to   || undefined;
    const authorId = req.query.author_id ? Number(req.query.author_id) : null;
    
    if (authorId !== null && (!Number.isInteger(authorId) || authorId <= 0)) {
      return res.status(400).json({ error: 'Invalid author_id' });
    }
  
    const tokens = normalizeCategories(req.query.categories);
    let categoryIds = [];
      
    if (tokens.length) {
      const { ids } = await resolveCategoryTokens(tokens, Category);
      if (!ids.length) return res.json([]);
      categoryIds = ids;
    }
  

    const page  = req.query.page  ? Number(req.query.page)  : null;
    const limit = req.query.limit ? Number(req.query.limit) : null;

    let postsArr = [];
    let paging = null;

    if (Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0) {
      const { rows, total, totalPages, perPage, page: currentPage } =
        await Post.findByFilterWithPagination({
          isAdmin,
          categoryIds,
          dateFrom,
          dateTo,
          status,
          viewerId,
          hideBothWays: true,
          page,
          perPage: limit,
          authorId,
          q,
        });

        postsArr = rows;
        paging = { total, page: currentPage, perPage, totalPages };
    } else {
      const posts = await Post.findByFilter({
        isAdmin, categoryIds, dateFrom, dateTo, status, viewerId, hideBothWays: true, authorId, q,
      });
      postsArr = posts || [];
    }
    
    if (!postsArr.length) {
      return res.json(paging ? { items: [], paging } : []);
    }
    
    const ids = postsArr.map(p => p.id);
    const counts = await Like.countForMultiplePosts(ids);
    const commentCounts = await Comment.countForMultiplePosts(ids);
    
    const withCounts = postsArr.map(p => {
      const c = counts[p.id] || { like: 0, dislike: 0 };
      const comments = commentCounts[p.id] || 0; 
      return { ...p, likes: c.like, dislikes: c.dislike, comments, score: c.like - c.dislike };
    });
    
    const helper = order === 'asc' ? 1 : -1;
    withCounts.sort((a, b) => {
      if (sort === 'date') {
        return (new Date(a.created_at) - new Date(b.created_at)) * helper;
      }
      if (a.score !== b.score) return (a.score - b.score) * helper;
      return (new Date(b.created_at) - new Date(a.created_at));
    });
    
    if (paging) {
      return res.json({ items: withCounts, paging });
    }
    return res.json(withCounts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

exports.getPostById = async (req, res) => {
  try{
    const { post_id } = req.params;
    const isAdmin = req.user?.status === 'admin';
    const viewerId = req.user?.id || null;
    const post = await Post.findById(post_id);
    
    if (!post) return res.status(404).json({ error: 'Post not found' });

    //only admins can request to see an inactive post by id 
    if (!isAdmin && post.status !== 'active' && post.author_id !== viewerId) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!isAdmin && viewerId && post.author_id !== viewerId) {
      const blocked = await Block.isBlockedEither(viewerId, post.author_id);
      if (blocked) return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, status, categories, locked } = req.body;

    const author_id = req.user?.id;

    if (!author_id) {
      return res.status(400).json({ error: 'Missing author' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Missing title' });
    }

    if (!content) {
        return res.status(400).json({ error: 'Missing content' });
    }

    if (status && !['active', 'inactive'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    if (content.length > 20000) {
        return res.status(400).json({ error: 'Content of the post is too long' });
    } 

    const names = normalizeCategories(categories);
    if (!names.length) {
      return res.status(400).json({ error: 'Missing categories' });
    }

    const ids = [];
    const missing = [];

    for (const name of names) {
      const cat = await Category.findByName(name);

      if (!cat) missing.push(name);
      else ids.push(cat.id);
    }
    if (missing.length) {
      return res.status(400).json({
        error: 'Unknown categories',
        missing 
      });
    }

    const postId = await Post.create({ author_id, title, content, status: status || 'active', locked });

    if (typeof Post.changeCategories === 'function') {
      await Post.changeCategories(postId, ids);
    }

    const created = await Post.findById(postId);
    const cats = await Category.findForPost(postId);
    return res.status(200).json({ ...created, categories: cats || [] });
  } catch (e){
    console.error(e);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

exports.updatePostByAuthor = async (req, res) => {
  try {
    const { post_id } = req.params;
    const me = req.user?.id;
    if (!me) return res.status(400).json({ error: 'Not authenticated' });

    const post = await Post.findById(post_id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author_id !== me) {
      return res.status(400).json({ error: 'Not enough rights to perform this action' });
    }


    if ('status' in (req.body || {})) {
      return res.status(400).json({ error: 'Status cannot be changed in this endpoint' });
    }

    const { title, content, categories, locked } = req.body || {};

    const wantTitle = title !== undefined;
    const wantContent = content !== undefined;
    const wantCats = categories !== undefined;
    const wantLocked = locked !== undefined;

    const lockedIncoming = wantLocked ? parseLocked(req.body.locked) : undefined;
    if (!wantLocked && !wantTitle && !wantContent && !wantCats) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    if (Number(post.locked) === 1) {
      if (!wantLocked) {
        return res.status(423).json({ error: 'Post is locked. Unlock it first to edit.' });
      }

      if (lockedIncoming === 1) {
        return res.status(400).json({ error: 'Post is already locked' });
      }

      if (wantTitle || wantContent || wantCats) {
        return res.status(400).json({ error: 'Unlock first, then edit other fields in a separate request' });
      }

      await Post.setLocked(post_id, 0);
      const unlocked = await Post.findById(post_id);
      const cats = await Category.findForPost(post_id);
      return res.status(200).json({ ...unlocked, categories: cats || [] });
    }
    
    if (wantLocked) {
      await Post.setLocked(post_id, lockedIncoming);
    }

    const changes = {};
    if (wantTitle) {
      const t = String(title).trim();
      if (!t) return res.status(400).json({ error: 'Title cannot be empty' });
      changes.title = t;
    }
    if (wantContent) {
      const c = String(content);
      if (c.length > 20000) return res.status(400).json({ error: 'Content is too long' });
      changes.content = c;
    }
    
    if (Object.keys(changes).length) {
      await Post.updateById(post_id, changes);
    }
    
    if (wantCats) {
      const tokens = normalizeCategories(categories);
      if (!tokens.length) return res.status(400).json({ error: 'Categories list is empty' });
    
      const { ids, missing } = await resolveCategoryTokens(tokens, Category);
      if (missing.length) {
        return res.status(400).json({ error: 'Unknown categories', missing });
      }
      await Post.changeCategories(post_id, ids);
    }
    
    const updated = await Post.findById(post_id);
    const cats = await Category.findForPost(post_id);

    return res.status(200).json({ ...updated, categories: cats || [] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to update post'});
  }
}

exports.updatePostByAdmin = async (req, res) => {
  try {
    const { post_id } = req.params;
    const isAdmin = req.user?.status === 'admin';
    if (!isAdmin) return res.status(400).json({ error: 'This action is admin only' });

    const post = await Post.findById(post_id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if ('title' in (req.body || {}) || 'content' in (req.body || {})) {
      return res.status(400).json({ error: 'Only status, locked and categories can be changed here' });
    }

    const { status, locked, categories } = req.body || {};
    let touched = false;

    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      await Post.updateStatus(post_id, status);
      touched = true;
    }

    if (locked !== undefined) {
      const lockedVal =
        (locked === true || locked === 1 ||
         String(locked).trim().toLowerCase() === 'true' ||
         String(locked).trim() === '1') ? 1 : 0;
      await Post.setLocked(post_id, lockedVal);
      touched = true;
    }

    if (categories !== undefined) {
      const tokens = normalizeCategories(categories);
      if (!tokens.length) return res.status(400).json({ error: 'Categories list is empty' });

      const { ids, missing } = await resolveCategoryTokens(tokens, Category);
      if (missing.length) {
        return res.status(400).json({ error: 'Unknown categories', missing });
      }
      await Post.changeCategories(post_id, ids);
      touched = true;
    }

    if (!touched) return res.status(400).json({ error: 'Nothing to update' });

    const updated = await Post.findById(post_id);
    const cats = await Category.findForPost(post_id);
    return res.status(200).json({ ...updated, categories: cats || [] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to update post as an admin' });
  }
};


exports.deletePost = async (req, res) => {
  try {
    const me = req.user?.id;
    const isAdmin = req.user?.status === 'admin';
    if (!me) return res.status(401).json({ error: 'Not authenticated' });

    const post = await Post.findById(req.params.post_id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // allow if admin or the author
    if (!isAdmin && post.author_id !== me) {
      return res.status(403).json({ error: 'Not enough rights to delete this post' });
    }

    const del = await Post.deleteById(req.params.post_id);
    if (!del) return res.status(404).json({ error: 'Post not found' });

    return res.status(204).end();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
};


exports.getPostCategories = async (req, res) => {
  try {
    const { post_id } = req.params;
    const isAdmin = req.user?.status === 'admin';
    const viewerId = req.user?.id || null;
  
    const post = await Post.findById(post_id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    if (!isAdmin && post.status !== 'active') {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!isAdmin && viewerId && post.author_id !== viewerId) {
      const blocked = await Block.isBlockedEither(viewerId, post.author_id);
      if (blocked) return res.status(404).json({ error: 'Post not found' });
    }
  
    const cats = await Category.findForPost(post_id);
    res.json(cats || []);
    } catch {
      res.status(500).json({ error: 'Failed to fetch post categories' });
    }
  };
