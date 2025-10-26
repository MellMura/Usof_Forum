const Model = require('./Model');
const db = require('../db');

class User extends Model {
  static table = 'users';

  static async findAll() {
    const result = await this.query(
      `SELECT id, login, full_name, email, pic_url, rating, elo, status
      FROM ${this.table} ORDER BY id`
    );
    if (result.length === 0) return null;
        return result || [];
  }

  static async findMany({ search = '', limit = 20, offset = 0, sort = 'login', order = 'asc'} = {}){
    const sorting = ['id', 'login', 'full_name', 'rating', 'elo', 'created_at'].includes(sort) ? sort : 'login';
    const ordering = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const params = [];
    const where = [];

    if (search) {
      const q = `%${String(search).toLowerCase()}%`;
      where.push(`(LOWER(login) LIKE ? OR LOWER(full_name) LIKE ?)`);
      params.push(q, q);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT id, login, full_name, email, pic_url, rating, elo, status
        FROM ${this.table}
        ${whereSql}
        ORDER BY ${sorting} ${ordering}
        LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    return rows || [];
  }

  static async countMany({ search = '' } = {}) {
    const params = [];
    const where = [];

    if (search) {
      const q = `%${String(search).toLowerCase()}%`;
      where.push(`(LOWER(login) LIKE ? OR LOWER(full_name) LIKE ?)`);
      params.push(q, q);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM ${this.table} ${whereSql}`, params);
    return rows?.[0]?.total ?? 0;
  }

  static async findByLogin(login) {
    const result = await this.query(
      `SELECT id, login, full_name, email, pic_url, rating, elo, status
      FROM ${this.table} WHERE login = ?`, [login]);

      if (result.length === 0) return null;
        return result[0];
  }

  static async findById(id) {
    const result = await this.query(
      `SELECT id, login, full_name, email, pic_url, rating, elo, status
      FROM ${this.table} WHERE id = ?`, [id]);

      if (result.length === 0) return null;
        return result[0];
  }

  static async findByEmail(email) {
    const em = String(email || '').trim()
    const rows = await this.query(
      `SELECT id, login, full_name, email, password, pic_url, rating, elo, status
       FROM ${this.table}
       WHERE email = ?
       LIMIT 1`,
      [em]
    )
    return rows?.[0] || null
  }
  
  static async findAuthByLogin(login) {
    const [rows] = await db.query(
      `SELECT id, login, password, status, email, email_verified
      FROM ${this.table} WHERE login = ?`, [login]);

    return rows[0] || null;
  }

  static async create({ login, passwordHash, full_name, email, status = 'user', rating = 0}) {
    const ratingNum = Number.isInteger(Number(rating)) ? Number(rating) : 0;
    
    const [res] = await db.query(
      `INSERT INTO ${this.table} (login, password, full_name, email, status, rating)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [login, passwordHash, full_name, email, status, ratingNum]
    );

    return res.insertId;
  }

  static async updateById(id, fields) {
    const allowed = new Set(['login', 'full_name', 'email', 'pic_url', 'rating', 'status']);
    const set = [];
    const vals = [];
  
    for (const [key, val] of Object.entries(fields || {})) {
      if (!allowed.has(key)) continue;
      if (val === undefined) continue;
  
      const normalized =
        (key === 'pic_url' && (val === '' || val === null)) ? null : val;
  
      set.push(`${key} = ?`);
      vals.push(normalized);
    }
  
    if (!set.length) return 0;
  
    vals.push(id);
    const [res] = await db.query(
      `UPDATE ${this.table} SET ${set.join(', ')} WHERE id = ? LIMIT 1`,
      vals
    );
    return res.affectedRows;
  }
  

  static async updateAvatar(id, picUrl) {
    const [res] = await db.query(
      `UPDATE ${this.table}
      SET pic_url = ? WHERE id = ?`,
      [picUrl, id]
    );

    return res.affectedRows;
  }

  static async deleteById(id) {
    const [res] = await db.query(
      `DELETE FROM ${this.table} WHERE id = ?`,
      [id]
    );

    return res.affectedRows;
  }
}

module.exports = User;
