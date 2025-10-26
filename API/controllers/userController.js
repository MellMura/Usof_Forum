const bcrypt = require('bcryptjs');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

exports.getAllUsers = async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();
    const limit  = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    const sort   = String(req.query.sort || 'login');
    const order  = String(req.query.order || 'asc');

    const items = await User.findMany({ search, limit, offset, sort, order });

    let total, hasMore;
    if (req.query.withTotal === '1' || req.query.withTotal === 'true') {
      total = await User.countMany({ search });
      hasMore = offset + items.length < total;
    } else {
      hasMore = items.length === limit;
    }
    return res.json({
      items,
      offset,
      limit,
      hasMore,
      ...(total !== undefined ? { total } : {}),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id);
    if (!user) return res.status(404).json({ error: 'Not found' });

    return res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch user by ID' });
  }
};


exports.createUser = async (req, res) => {
  try {
    const { login, password, passwordConfirm, email, full_name, status = 'user', rating } =req.body;
    
    const isAdmin = req.user?.status === 'admin';
        
    if (!login || !password || !passwordConfirm || !email || !full_name) {
      return res.status(400).json({ error: 'Missing fields for the creation of new user' });
    } 

    if (password !== passwordConfirm) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (await User.findByLogin(login) != null) {
      return res.status(400).json({ error: 'Login already taken' });
    }

    if (await User.findByEmail(email) != null) {
        return res.status(400).json({ error: 'E-mail already taken' });
    }
    
    let ratingNum = 0;
    if (rating !== undefined) {
      const n = Number(rating);
      if (!Number.isInteger(n)) {
        return res.status(400).json({ error: 'Rating must be an integer' });
      }
      if (!isAdmin && n !== 0) {
        return res.status(403).json({ error: 'Only admins can define rating' });
      }
      ratingNum = n;
    }


    const passwordHash = bcrypt.hashSync(password, 12);
    const id = await User.create({ login, passwordHash, full_name, email, status, rating: ratingNum });
    const created = await User.findById(id);
    res.status(200).json(created);
  } catch (e){
    console.error(e);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file given' });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const picUrl = `/uploads/avatars/${req.file.filename}`;

    const existing = await User.findById(userId);
    if (existing?.pic_url) {
      try {
        const abs = path.join(process.cwd(), existing.pic_url.replace(/^\//, ''));
        if (abs.startsWith(path.join(process.cwd(), 'uploads'))) fs.unlink(abs, () => {});
      } catch {}
    }
    
    await User.updateAvatar(userId, picUrl);
    const updated = await User.findById(req.user.id);
    res.status(200).json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update avatar' });
  }
}

exports.uploadAvatarAdmin = async (req, res) => {
  try {
    const isAdmin = req.user?.status === 'admin';
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' });

    const userId = Number(req.params.user_id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    if (!req.file) return res.status(400).json({ error: 'No file given' });

    const picUrl = `/uploads/avatars/${req.file.filename}`;

    const existing = await User.findById(userId);
    if (existing?.pic_url) {
      try {
        const abs = path.join(process.cwd(), existing.pic_url.replace(/^\//, ''));
        if (abs.startsWith(path.join(process.cwd(), 'uploads'))) fs.unlink(abs, () => {});
      } catch {}
    }

    await User.updateAvatar(userId, picUrl);
    const updated = await User.findById(userId);
    res.status(200).json(updated);
  } catch (e) {
    console.error('[uploadAvatarAdmin] error:', e);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.user_id;
    const meId = req.user?.id;
    const isAdmin = req.user?.status === 'admin';

    if (!meId) {
      return res.status(400).json({ error: 'Not authenticated' });
    }

    if (!isAdmin && String(meId) !== String(id)) {
      return res.status(400).json({ error: 'Not enough rights to update this user' });
    }


    const allowed = ['login','full_name','email','pic_url','rating','status'];
    const changes = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) changes[k] = req.body[k];
    }
    if (!Object.keys(changes).length) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    if (!isAdmin && (Object.prototype.hasOwnProperty.call(changes, 'status') ||
    Object.prototype.hasOwnProperty.call(changes, 'rating'))) {
      return res.status(400).json({ error: 'Only admins can change status/rating' });
    }

    if (changes.status && !['user','admin'].includes(changes.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (changes.rating !== undefined) {
    const n = Number(changes.rating);
    
    if (!Number.isInteger(n)) return res.status(400).json({ error: 'rating must be an integer' });
    changes.rating = n;
    }

    const existing = await User.findById(id);
    if (!existing) return res.status(404).json({ error: 'User not found' });

    if (changes.login && changes.login !== existing.login) {
      const taken = await User.findByLogin(changes.login);
      if (taken && String(taken.id) !== String(id)) {
        return res.status(400).json({ error: 'Login already taken' });
      }
    }

    if (changes.email && changes.email !== existing.email) {
      const taken = await User.findByEmail(changes.email);
      if (taken && String(taken.id) !== String(id)) {
        return res.status(400).json({ error: 'E-mail already taken' });
      }
    }

    await User.updateById(id, changes);
    const updated = await User.findById(id);
    return res.status(200).json(updated);

  } catch (e){
    console.error(e);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const del = await User.deleteById(req.params.user_id);

    if (!del) return res.status(404).json({ error: 'User not found' });
    return res.status(204).end();
  } catch {
    return res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.deleteAvatar = async (req, res) => {
  try {
    const targetId = req.params.user_id;
    const meId     = req.user?.id;
    const isAdmin  = req.user?.status === 'admin';

    if (!meId) return res.status(401).json({ error: 'Not authenticated' });
    if (!isAdmin && String(meId) !== String(targetId)) {
      return res.status(403).json({ error: 'Not enough rights to delete this avatar' });
    }

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.pic_url) {
      const abs = path.join(__dirname, '..', user.pic_url.replace(/^\//, ''));
      try { fs.unlinkSync(abs); } catch { }
    }

    await User.updateById(targetId, { pic_url: null });
    const updated = await User.findById(targetId);
    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to delete avatar' });
  }
};
