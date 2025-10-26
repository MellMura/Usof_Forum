const db = require('../db');
const Model = require('./Model');

class Block extends Model{
  constructor() {
    super("user_blocks");
  }
    
  static async block({ blocker_id, blocked_id }) {
    if (blocker_id === blocked_id) return 0;
    const [res] = await db.query(
      `INSERT INTO user_blocks (blocker_id, blocked_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE blocked_id = VALUES(blocked_id)`,
      [blocker_id, blocked_id]
    );
    return res.affectedRows;
  }

  static async unblock({ blocker_id, blocked_id }) {
    const [res] = await db.query(
      `DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?`,
      [blocker_id, blocked_id]
    );
    return res.affectedRows;
  }

  static async getBlockedUsers(blocker_id) {
    const [rows] = await db.query(
      `SELECT blocked_id FROM user_blocks WHERE blocker_id = ?`,
      [blocker_id]
    );
    return rows.map(r => r.blocked_id);
  }

  static async listBlockers(blocked_id) {
    const [rows] = await db.query(
      `SELECT blocker_id FROM user_blocks WHERE blocked_id = ?`,
      [blocked_id]
    );
    return rows.map(r => r.blocker_id);
  }

  static async isBlockedEither(a_id, b_id) {
    const [rows] = await db.query(
      `SELECT 1 FROM user_blocks
        WHERE (blocker_id = ? AND blocked_id = ?)
           OR (blocker_id = ? AND blocked_id = ?)
        LIMIT 1`,
      [a_id, b_id, b_id, a_id]
    );
    return rows.length > 0;
  }
}

module.exports = Block;
