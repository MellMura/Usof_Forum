const Model = require('./Model');
const db = require('../db');

class Bookmark extends Model {
  constructor() {
    super("post_bookmarks");
  }

  static async create({ post_id, user_id, author }) {
    const [res] = await db.query(
        `INSERT INTO post_bookmarks (post_id, user_id, author)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE author = VALUES(author)`,
        [post_id, user_id, author]
      );
  
      return res.affectedRows >= 1;
  }

  static async remove({ post_id, user_id }) {
    const [res] = await db.query(
        `DELETE FROM post_bookmarks WHERE post_id = ? AND user_id = ?`,
        [post_id, user_id]
    );

    return res.affectedRows;
  }

  static async findById({ post_id, user_id }) {
    const rows = await db.query(
        `SELECT 1 FROM post_bookmarks WHERE post_id = ? AND user_id = ? LIMIT 1`,
        [post_id, user_id]
    );
    
    return rows[0]?.length > 0;
  }

  static async findForUser(user_id, { includeInactive = false } = {}) {
    const rows = await db.query(
        `SELECT p.id, p.author_id, u.login AS author, u.status AS author_status, u.rating AS author_rating, u.pic_url AS pic_url, p.title, p.created_at, p.status, p.content, p.locked,
                b.created_at AS bookmarked_at
           FROM post_bookmarks b
           JOIN posts p ON p.id = b.post_id
           JOIN users u ON u.id = p.author_id
          WHERE b.user_id = ?
            ${includeInactive ? '' : `AND p.status = 'active'`}
          ORDER BY b.created_at DESC`,
        [user_id]
      );
      return rows[0] || [];
  }
}

module.exports = Bookmark;