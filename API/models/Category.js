const Model = require('./Model');
const db = require('../db');

class Category extends Model {
  constructor() {
    super("categories");
  }

  static async findAll() {
    const result = await this.query(
      `SELECT id, name, description
      FROM categories ORDER BY id`
    );
    if (result.length === 0) return null;
    return result;
  }

  static async findById(id) {
    const result = await this.query(
      `SELECT id, name, description
      FROM categories WHERE id = ?`, [id]
    );

    if (result.length === 0) return null;
    return result[0];
  }

  static async findByName(name) {
    const result = await this.query(
      `SELECT id, name, description
      FROM categories WHERE name = ?`, [name]
    );

    if (result.length === 0) return null;
    return result[0];
  }

  static async findForPost(post_id) {
    const rows = await this.query(
      `SELECT c.id, c.name, c.description
       FROM post_categories pc
       LEFT JOIN categories c ON c.id = pc.category_id
       WHERE pc.post_id = ?
       ORDER BY c.id`,
      [post_id]
    );
    return rows.filter(r => r.id != null);
  }

  static async findAllPosts(category_id) {
    const result = await this.query(
      `SELECT id, name, description
        FROM categories
        WHERE name = ?
        LIMIT 1`,
        [String(name).trim()]
    );

    if (result.length === 0) return null; return result;
  }

  static async findAllActivePosts(category_id) {
    const rows = await this.query(
      `SELECT p.id, p.author, p.title, p.created_at, p.status, p.content
        FROM posts p
        INNER JOIN post_categories pc ON pc.post_id = p.id
        WHERE pc.category_id = ? AND p.status = 'active'
        ORDER BY p.id`, [category_id] 
    );

    return rows.filter(r => r.id != null);
  }

  static async create ({ name, description = null }) {
    const [res] = await db.query(
      `INSERT INTO categories (name, description)
      VALUES (?, ?)`,
      [name, description]
    );
    
    return res.insertId;
  }

  static async updateById(id, fields = {}) {
    const allowed = ['name', 'description'];
    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (keys.length === 0) return 0;

    const sets = keys.map(k => `${k} = ?`).join(', ');
    const vals = keys.map(k => fields[k]);

    const [res] = await db.query(
      `UPDATE categories SET ${sets} WHERE id = ?`,
      [...vals, id]
    );
    return res.affectedRows;
  }

  static async deleteById(id) {
    const [res] = await db.query(
      `DELETE FROM categories WHERE id = ?`,
      [id]
    );

    return res.affectedRows;
  }
  
}

module.exports = Category;