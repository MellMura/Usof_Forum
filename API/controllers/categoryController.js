const Category = require('../models/Category');
const Post = require('../models/Post');
const Like = require('../models/Like');

exports.getAllCategories = async (req, res) => {
  try {
    const cats = await Category.findAll();
    res.json(cats|| []);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.category_id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.status(200).json(cat);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const isAdmin = req.user?.status === 'admin';

    //if (!isAdmin) return res.status(400).json({ error: 'Not enough rights to create category' });
    
    const {name, description = null} = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const existing = await Category.findByName(name.trim());

    if (existing) {
      return res.status(400).json({ error: 'Category name already taken' });
    }

    const id = await Category.create({ name: name.trim(), description });
    const created = await Category.findById(id);
    return res.status(200).json(created);
  } catch (e){
    console.error(e);
    return res.status(500).json({ error: 'Failed to create category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const isAdmin = req.user?.status === 'admin';
    
    //if (!isAdmin) return res.status(400).json({ error: 'Not enough rights to update category' });

    const { name, description } = req.body || {};

    if (name == null && description == null) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    if (name != null) {
      const dup = await Category.findByName(name.trim());
      
      if(dup && String(dup.id) !== String(req.params.category_id)) {
        return res.status(400).json({ error: 'Category name already taken' });
      }
    }

    const changed = await Category.updateById(req.params.category_id, {
      name: name?.trim?.() ?? name,
      description,
    });

    if (!changed) return res.status(404).json({ error: 'Category not found' });

    const updated = await Category.findById(req.params.category_id);
    return res.json(updated);
  } catch {
    return res.status(500).json({ error: 'Failed to update category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const isAdmin = req.user?.status === 'admin';
    //if (!isAdmin) return res.status(400).json({ error: 'Not enough rights to delete category' });
  
    const del = await Category.deleteById(req.params.category_id);
    
    if (!del) return res.status(404).json({ error: 'Category not found' });
    
    return res.status(200).end();
  } catch {
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

exports.getCategoryPosts = async (req, res) => {
  try {
    const isAdmin  = req.user?.status === 'admin';
    const viewerId = req.user?.id || null;
    const categoryId = Number(req.params.category_id);

    if (!Number.isFinite(categoryId)) {
      return res.status(400).json({ error: 'Invalid category_id' });
    }

    const cat = await Category.findById(categoryId);
    if (!cat) return res.status(404).json({ error: 'Category not found' });

    //allowed filters
    const sort  = String(req.query.sort  || 'likes').toLowerCase();
    const order = String(req.query.order || 'desc').toLowerCase();
    const dateFrom = req.query.date_from || req.query.from || undefined;
    const dateTo   = req.query.date_to   || req.query.to   || undefined;
    const status   = isAdmin ? (req.query.status || undefined) : undefined;

    const page  = req.query.page  ? Number(req.query.page)  : null;
    const limit = req.query.limit ? Number(req.query.limit) : null;

    let items = [];
    let paging = null;

    if (Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0) {
      //pagination
      const { rows, total, totalPages, perPage, page: currentPage } =
        await Post.findByFilterWithPagination({
          isAdmin,
          categoryIds: [categoryId],
          dateFrom,
          dateTo,
          status,
          viewerId,
          hideBothWays: true,
          page,
          perPage: limit,
        });

      items = rows || [];
      paging = { total, page: currentPage, perPage, totalPages };
    } else {
      items = await Post.findByFilter({
        isAdmin,
        categoryIds: [categoryId],
        dateFrom,
        dateTo,
        status,
        viewerId,
        hideBothWays: true,
      });
      items = items || [];
    }

    if (!items.length) {
      return res.json(paging ? { items: [], paging } : []);
    }

    const ids = items.map(p => p.id);
    const countsMap = await Like.countForMultiplePosts(ids);

    const withCounts = items.map(p => {
      const c = countsMap[p.id] || { like: 0, dislike: 0 };
      return { ...p, likes: c.like, dislikes: c.dislike, score: c.like - c.dislike };
    });

    const dir = order === 'asc' ? 1 : -1;
    withCounts.sort((a, b) => {
      //sorting by date
      if (sort === 'date') {
        return (new Date(a.created_at) - new Date(b.created_at)) * dir;
      }
      //default- sort by popularity
      if (a.score !== b.score) return (a.score - b.score) * dir;
      return (new Date(b.created_at) - new Date(a.created_at));
    });

    if (paging) return res.json({ items: withCounts, paging });
    return res.json(withCounts);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to fetch category posts' });
  }
};
