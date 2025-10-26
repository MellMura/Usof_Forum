const Model = require('./Model');
const db = require('../db');


class Post extends Model {
  constructor() {
    super("posts");
  }

  static async idsByAuthorId(authorId) {
    const rows = await this.query(`SELECT id FROM posts WHERE author_id = ?`, [authorId]);
    return (rows || []).map(r => r.id);
  }

  static async findAll() {
    const result = await this.query(
      `SELECT p.id, p.author_id, u.login AS author, u.status AS author_status, u.rating AS author_rating, u.pic_url AS pic_url, p.title, p.created_at, p.status, p.content, p.locked
      FROM posts p
      JOIN users u ON u.id = p.author_id
      ORDER BY p.id`
    );
    if (result.length === 0) return null;
    return result;
  }

  static async findAllActive() {
    const result = await this.query(
      `SELECT p.id, p.author_id, u.login AS author, u.status AS author_status, u.rating AS author_rating, u.pic_url AS pic_url, p.title, p.created_at, p.status, p.content, p.locked
      FROM posts p
      JOIN users u ON u.id = p.author_id
      WHERE p.status = 'active'
      ORDER BY p.id`
    );
    if (result.length === 0) return null;
    return result;
  }

  static async findById(id) {
    const result = await this.query(
      `SELECT p.id, p.author_id, u.login AS author, u.status AS author_status, u.rating AS author_rating, u.pic_url AS pic_url, p.title, p.created_at, p.status, p.content, p.locked
      FROM posts p
      JOIN users u ON u.id = p.author_id
      WHERE p.id = ?`, [id]
    );

    if (result.length === 0) return null;
    return result[0];
  }

  static async findByCategoryAll(category_id) {
    const rows = await this.query(
      `SELECT p.id, p.author_id, u.login AS author, u.status AS author_status, u.rating AS author_rating, u.pic_url AS pic_url, p.title, p.created_at, p.status, p.content, p.locked
       FROM posts p
       JOIN users u ON u.id = p.author_id
       JOIN post_categories pc ON pc.post_id = p.id
       WHERE pc.category_id = ?
       ORDER BY p.created_at DESC`,
      [category_id]
    );
    return rows ?? [];
  }

  static async findByCategoryActive(category_id) {
    const rows = await this.query(
      `SELECT p.id, p.author_id, u.login AS author, u.status AS author_status, u.rating AS author_rating, u.pic_url AS pic_url, p.title, p.created_at, p.status, p.content, p.locked
       FROM posts p
       JOIN users u ON u.id = p.author_id
       JOIN post_categories pc ON pc.post_id = p.id
       WHERE pc.category_id = ? AND p.status = 'active'
       ORDER BY p.created_at DESC`,
      [category_id]
    );
    return rows ?? [];
  }

  static async findByFilter({ isAdmin = false, categoryIds = [], dateFrom, dateTo, status, viewerId = null, hideBothWays = true, authorId = null, } = {}) {
    const where = [];
    const params = [];
    let join = '';

    //getting author so we can see our own inactive posts (where author = viewerId)
    join += ` INNER JOIN users u ON u.id = p.author_id `;

    if (Number.isInteger(authorId) && authorId > 0) {
      where.push(`p.author_id = ?`);
      params.push(authorId);
    }  

    //users see only active, admins see all
    if (!isAdmin) {
      if (viewerId) {
        where.push(`(p.status = 'active' OR u.id = ?)`);
        params.push(viewerId);
      } else {
        where.push(`p.status = 'active'`);
      }
    } else if (status && ['active', 'inactive'].includes(status)) {
      where.push(`p.status = ?`);
      params.push(status);
    }

    if (Array.isArray(categoryIds) && categoryIds.length) {
      join += ` INNER JOIN post_categories pc ON pc.post_id = p.id `;
      where.push(`pc.category_id IN (?)`);
      params.push(categoryIds);
    }

    //inclusive date interval
    if (dateFrom) { where.push(`p.created_at >= ?`); params.push(dateFrom); }
    if (dateTo) { where.push(`p.created_at <= ?`); params.push(dateTo); }

    //filter out the posts of blocked users or users that block you

    if (viewerId) {
      where.push(`u.id NOT IN (SELECT blocked_id FROM user_blocks WHERE blocker_id = ?)`);
      params.push(viewerId);

      if (hideBothWays) {
        where.push(`u.id NOT IN (SELECT blocker_id FROM user_blocks WHERE blocked_id = ?)`);
        params.push(viewerId);
      }
    }

    const sql = `SELECT p.id, p.author_id, u.login AS author, u.status AS author_status, u.rating AS author_rating, u.pic_url AS pic_url, p.title, p.created_at, p.status, p.content, p.locked
      FROM posts p
      ${join}
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      GROUP BY p.id
      ORDER BY p.id
    `;

    const rows = await this.query(sql, params);
    return rows ?? [];
  }

  static async create({ author_id, title, content, status = 'active', locked = 0 }) {
    const [res] = await db.query(
      `INSERT INTO posts (author_id, title, status, content, locked)
      VALUES (?, ?, ?, ?, ?)`,
      [author_id, title, status, content, locked ? 1 : 0]
    );
    return res.insertId;
  }

  // in models/Post.js

  static async findByFilterWithPagination({
    isAdmin = false,
    categoryIds = [],
    dateFrom,
    dateTo,
    status,
    viewerId = null,
    hideBothWays = true,
    page = 1,
    perPage = 5,
    authorId = null,
    q = '',
  } = {}) {
    const where = [];
    const params = [];
    let join = '';

    join += ` INNER JOIN users u ON u.id = p.author_id `;

    if (q) {
      const s = `%${String(q).toLowerCase()}%`;
      where.push(`(LOWER(p.title) LIKE ? OR LOWER(p.content) LIKE ?)`);
      params.push(s, s);
    }

    if (Number.isInteger(authorId) && authorId > 0) {
      where.push(`p.author_id = ?`);
      params.push(authorId);
    }  

    if (!isAdmin) {
      if (viewerId) {
        where.push(`(p.status = 'active' OR u.id = ?)`);
        params.push(viewerId);
      } else {
        where.push(`p.status = 'active'`);
      }
    } else if (status && ['active', 'inactive'].includes(status)) {
      where.push(`p.status = ?`);
      params.push(status);
    }

    if (Array.isArray(categoryIds) && categoryIds.length) {
      join += ` INNER JOIN post_categories pc ON pc.post_id = p.id `;
      where.push(`pc.category_id IN (?)`);
      params.push(categoryIds);
    }

    if (dateFrom) { where.push(`p.created_at >= ?`); params.push(dateFrom); }
    if (dateTo) { where.push(`p.created_at <= ?`); params.push(dateTo); }

    if (viewerId) {
      where.push(`u.id NOT IN (SELECT blocked_id FROM user_blocks WHERE blocker_id = ?)`);
      params.push(viewerId);

      if (hideBothWays) {
        where.push(`u.id NOT IN (SELECT blocker_id FROM user_blocks WHERE blocked_id = ?)`);
        params.push(viewerId);
      }
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countSQL = `
    SELECT COUNT(DISTINCT p.id) AS total
    FROM posts p
    ${join}
    ${whereSQL}
  `;
    const [countRows] = await db.query(countSQL, params);
    const total = Number(countRows?.[0]?.total || 0);

    const safePerPage = Math.min(Math.max(parseInt(perPage) || 20, 1), 100);
    const safePage = Math.max(parseInt(page) || 1, 1);
    const offset = (safePage - 1) * safePerPage;

    const dataSQL = `
    SELECT p.id, p.author_id, u.login AS author, u.status AS author_status, u.rating AS author_rating, u.pic_url AS pic_url, p.title, p.created_at, p.status, p.content, p.locked
    FROM posts p
    ${join}
    ${whereSQL}
    GROUP BY p.id
    ORDER BY p.id
    LIMIT ? OFFSET ?
  `;
    const dataParams = [...params, safePerPage, offset];
    const [rows] = await db.query(dataSQL, dataParams);

    return {
      rows: rows || [],
      total,
      page: safePage,
      perPage: safePerPage,
      totalPages: Math.max(Math.ceil(total / safePerPage), 1),
    };
  }

  static async updateStatus(id, status) {
    const [res] = await db.query(
      `UPDATE posts SET status = ? WHERE id = ?`,
      [status, id]
    );
    return res.affectedRows;
  }


  static async updateById(id, fields) {
    const set = [];
    const vals = [];

    if (fields.title !== undefined) { set.push('title = ?'); vals.push(fields.title); }

    if (fields.content !== undefined) { set.push('content = ?'); vals.push(fields.content); }

    if (!set.length) return 0;
    vals.push(id);

    const [res] = await db.query(`UPDATE posts SET ${set.join(', ')} WHERE id = ?`, vals);
    return res.affectedRows;
  }

  static async getCategories(postId) {
    const rows = await this.query(
      `SELECT c.id, c.name
         FROM categories c
         JOIN post_categories pc ON pc.category_id = c.id
        WHERE pc.post_id = ?
        ORDER BY c.name`,
      [postId]
    );
    return rows || [];
  }

  static async changeCategories(postId, categoryIds = []) {
    if (!postId) throw new Error('changeCategories called without valid postId');

    await db.query(`DELETE FROM post_categories WHERE post_id = ?`, [postId]);

    const ids = [...new Set(categoryIds)]
      .map(Number)
      .filter(n => Number.isFinite(n) && n > 0);

    if (!ids.length) return true;

    const placeholders = ids.map(() => '(?, ?)').join(', ');
    const params = ids.flatMap(cid => [postId, cid]);
    await db.query(
      `INSERT INTO post_categories (post_id, category_id) VALUES ${placeholders}`,
      params
    );
    return true;
  }


  static async deleteById(id) {
    const [res] = await db.query(
      `DELETE FROM posts WHERE id = ?`,
      [id]
    );

    return res.affectedRows;
  }

  static async changeCategories(postId, categoryIds = []) {
    if (!postId) throw new Error('changeCategories called without valid postId');

    await this.query(`DELETE FROM post_categories WHERE post_id = ?`, [postId]);

    const ids = [...new Set(categoryIds)].filter(id => id != null);
    if (!ids.length) return true;

    const values = ids.map(cid => [postId, cid]);
    await this.query(
      `INSERT INTO post_categories (post_id, category_id) VALUES ?`,
      [values]
    );
    return true;
  }

  static async setLocked(id, locked) {
    const [res] = await db.query(`UPDATE posts SET locked = ? WHERE id = ?`, [locked ? 1 : 0, id]);
    return res.affectedRows;
  }

  /*static async isLocked(id) {
    const rows = await this.query(`SELECT locked FROM posts WHERE id = ?`, [id]);
    if (!rows?.length) return null;
    return Number(rows[0].locked) === 1;
  }*/
}

module.exports = Post;
