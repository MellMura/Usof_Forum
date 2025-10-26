const db = require('../db');

class Model {
  static table = '';

  static async query(sql, params = []) {
    const [rows] = await db.query(sql, params);
    return rows;
  }
}

module.exports = Model;
