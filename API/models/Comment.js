const Model = require('./Model');
const db = require('../db');

class Comment extends Model {
  constructor() {
    super("comments");
  }

  static async idsByAuthorId(authorId) {
    const rows = await this.query(`SELECT id FROM comments WHERE author_id = ?`, [authorId]);
    return (rows || []).map(r => r.id);
  }

  static async findAll() {
    const result = await this.query(
      `SELECT c.id, c.post_id, c.parent_id, c.author_id, u.login AS author, u.status AS author_status, u.pic_url AS pic_url, c.created_at, c.status, c.content, c.locked
      FROM comments c
      JOIN users u ON u.id = c.author_id
      ORDER BY c.id`
    );
    if (result.length === 0) return null;
    return result;
  }

  static async findAllActive() {
    const result = await this.query(
      `SELECT c.id, c.post_id, c.parent_id, c.author_id, u.login AS author, u.status AS author_status, u.pic_url AS pic_url, c.created_at, c.status, c.content, c.locked
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.status = 'active'
      ORDER BY c.id`
    );
    if (result.length === 0) return null;
    return result;
  }

  static async findById(id) {
    const rows = await this.query(
      `SELECT c.id, c.post_id, c.parent_id, c.author_id, u.login AS author, u.rating AS author_rating, u.status AS author_status, u.pic_url AS pic_url, c.created_at, c.status, c.content, c.locked
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.id = ?
      ORDER BY c.id`, [id]
    );

    if (rows.length === 0) return null;

    return rows[0];
  }

  static async findMany({
    includeInactive = false,
    post_id = null,
    author_id = null,
    status = null,
    offset = 0,
    limit = 20,
    sqlSort = 'date',
    sqlOrder = 'desc',
  } = {}) {
    const where = [];
    const params = [];
  
    if (!includeInactive) {
      where.push(`c.status = 'active'`);
      where.push(`p.status = 'active'`);
    } else if (status) {
      where.push(`c.status = ?`);
      params.push(status);
    }
  
    if (post_id != null) { where.push(`c.post_id = ?`); params.push(post_id); }
    if (author_id != null) { where.push(`c.author_id = ?`); params.push(author_id); }
  
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  
    const sortCol = sqlSort === 'id' ? 'c.id' : 'c.created_at';
    const ord = (sqlOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
    const sql = `
      SELECT
        c.id, c.post_id, c.parent_id, c.author_id,
        u.login AS author, u.rating AS author_rating, u.status AS author_status, u.pic_url AS pic_url,
        c.created_at, c.status, c.content, c.locked
      FROM comments c
      JOIN users u ON u.id = c.author_id
      JOIN posts p ON p.id = c.post_id
      ${whereSql}
      ORDER BY ${sortCol} ${ord}, c.id ${ord}
      LIMIT ? OFFSET ?
    `;
  
    params.push(Number(limit), Number(offset));
  
    const rows = await this.query(sql, params);
    return rows || [];
  }

  static async findByPost(post_id) {
    const result = await this.query(
      `SELECT c.id, c.post_id, c.parent_id, c.author_id, u.login AS author, u.rating AS author_rating, u.status AS author_status, u.pic_url AS pic_url, c.created_at, c.status, c.content, c.locked
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.post_id = ?
      ORDER BY c.id`, [post_id]
    );

    if (result.length === 0) return null;
    return result;
  }

  static async findActiveForPost(post_id) {
    const result = await this.query(
      `SELECT c.id, c.post_id, c.parent_id, c.author_id, u.login AS author, u.rating AS author_rating, u.status AS author_status, u.pic_url AS pic_url, c.created_at, c.status, c.content, c.locked
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.post_id = ? AND c.status = 'active'
      ORDER BY c.id`,
      [post_id]
    );

    if (result.length === 0) return null;
    return result;
  }

  static async create({ post_id, parent_id = null, author_id, content, status = 'active', locked = 0}) {
    const [res] = await db.query(
      `INSERT INTO comments (post_id, parent_id, author_id, status, content, locked)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [post_id, parent_id, author_id, status, content, locked ? 1 : 0]
    );
    return res.insertId;
  }

  static async updateStatus(id, status) {
    const [res] = await db.query(
      `UPDATE comments SET status = ? WHERE id = ?`,
      [status, id]
    );
    return res.affectedRows;
  }

  static async updateContent(id, content) {
    const [res] = await db.query(
      `UPDATE comments SET content = ? WHERE id = ?`,
      [content, id]
    );
    return res.affectedRows;
  }


  static async deleteById(id) {
    const [res] = await db.query(
      `DELETE FROM comments WHERE id = ?`,
      [id]
    );

    return res.affectedRows;
  }

  static async deleteByPost(post_id) {
    const [res] = await db.query(
      `DELETE FROM comments WHERE post_id = ?`,
      [post_id]
    );

    return res.affectedRows;
  }

  static async setLocked(id, locked) {
    const [res] = await db.query(`UPDATE comments SET locked = ? WHERE id = ?`, [locked ? 1 : 0, id]);
    return res.affectedRows;
  }
  
  static async countForMultiplePosts(postIds = []) {
    if (!Array.isArray(postIds) || postIds.length === 0) return {};
    const rows = await this.query(
      `SELECT post_id, COUNT(*) AS cnt
        FROM comments
        WHERE status = 'active' AND post_id IN (?)
        GROUP BY post_id`,
      [postIds]
    );

    const map = {};
    
    for (const r of rows || []) map[r.post_id] = Number(r.cnt || 0);
    return map;
  }
}

module.exports = Comment;