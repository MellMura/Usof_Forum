const Model = require('./Model');
const db = require('../db');
const Post = require('./Post');
const Comment = require('./Comment');

function normalizeType(t) {
  const s = String(t || '').toLowerCase();
  return (s === 'like' || s === 'dislike') ? s : 'like';
}
class Like extends Model {
  constructor() {
    super("post_likes");
  }

  static async postIdsByAuthorId(userId) {
    const [rows] = await db.query(`SELECT id FROM posts WHERE author_id = ?`, [userId]);
    return (rows || []).map(r => r.id);
  }

  static async commentIdsByAuthorId(userId) {
    const [rows] = await db.query(`SELECT id FROM comments WHERE author_id = ?`, [userId]);
    return (rows || []).map(r => r.id);
  }

  static async recountUserRatingByUserId(userId) {
    const postIds = await Like.postIdsByAuthorId(userId);
    const commentIds = await Like.commentIdsByAuthorId(userId);

    let total = 0;

    for (const pid of postIds) {
      const c = await Like.countForPost(pid);
      total += (c.like - c.dislike);
    }

    for (const cid of commentIds) {
      const c = await Like.countForComment(cid);
      total += (c.like - c.dislike);
    }

    if (total < 0) total = 0;
    await db.query(`UPDATE users SET rating = ? WHERE id = ?`, [total, userId]);

    return total;
  }

  static async recountByPostId(postId) {
    const [r] = await db.query(`SELECT author_id FROM posts WHERE id = ? LIMIT 1`, [postId]);
    const uid = r?.[0]?.author_id;
    return uid ? Like.recountUserRatingByUserId(uid) : null;
  }

  static async recountByCommentId(commentId) {
    const [r] = await db.query(`SELECT author_id FROM comments WHERE id = ? LIMIT 1`, [commentId]);
    const uid = r?.[0]?.author_id;
    return uid ? Like.recountUserRatingByUserId(uid) : null;
  }


  static async createForPost({ post_id, user_id, author, type = 'like' }) {
    type = normalizeType(type);
    const [res] = await db.query(
      `INSERT INTO post_likes (post_id, user_id, author, type)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         type = VALUES(type),
         author = VALUES(author),
         created_at = CURRENT_TIMESTAMP`,
      [post_id, user_id, author, type]
    );
    return res.affectedRows;
  }

  static async removeForPost({ post_id, user_id }) {
    const [res] = await db.query(
      `DELETE FROM post_likes WHERE post_id = ? AND user_id = ?`,
      [post_id, user_id]
    );
    return res.affectedRows;
  }

  static async findAllForPost(post_id) {
    const result = await this.query(
        `SELECT user_id, type, author, created_at
        FROM post_likes 
        WHERE post_id = ?
        ORDER BY created_at DESC`,
        [post_id]
      );

    if (result.length === 0) return null;
      
    return result;
  }

  static async createForComment({ comment_id, user_id, type = 'like' }) {
    type = normalizeType(type);
    const [res] = await db.query(
      `INSERT INTO comment_likes (comment_id, user_id, type)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         type = VALUES(type),
         created_at = CURRENT_TIMESTAMP`,
      [comment_id, user_id, type]
    );
    return res.affectedRows;
  }

  static async removeForComment({ comment_id, user_id }) {
    const [res] = await db.query(
      `DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?`,
      [comment_id, user_id]
    );
    return res.affectedRows;
  }
  static async findAllForComment(comment_id) {
    const result = await this.query(
      `SELECT user_id, type, created_at
        FROM comment_likes 
        WHERE comment_id = ?
        ORDER BY created_at DESC`,
      [comment_id]
    );

    if (result.length === 0) return null;
      
    return result;
  }

  static async countForPost(post_id) {
    const rows = await this.query(
      `SELECT
        COUNT(IF(type='like', 1, NULL)) AS likes,
        COUNT(IF(type='dislike', 1, NULL)) AS dislikes
        FROM post_likes
        WHERE post_id = ?`,
      [post_id]
    );

    const likes = Number(rows?.[0]?.likes ?? 0);
    const dislikes = Number(rows?.[0]?.dislikes ?? 0);
    return { like: likes, dislike: dislikes };
  }

  static async countForMultiplePosts(postIds = []) {
    if (!postIds.length) return {};
    const rows = await this.query(
      `SELECT post_id,
        COUNT(IF(type='like', 1, NULL)) AS likes,
        COUNT(IF(type='dislike', 1, NULL)) AS dislikes
       FROM post_likes
       WHERE post_id IN (?)
       GROUP BY post_id`,
      [postIds]
    );
    const map = {};
    for (const r of rows) {
      map[r.post_id] = { like: Number(r.likes || 0), dislike: Number(r.dislikes || 0) };
    }
    return map;
  }

  static async countForComment(comment_id) {
    const rows = await this.query(
      `SELECT
        COUNT(IF(type='like', 1, NULL)) AS likes,
        COUNT(IF(type='dislike', 1, NULL)) AS dislikes
        FROM comment_likes
        WHERE comment_id = ?`,
      [comment_id]
    );

    const likes = Number(rows?.[0]?.likes ?? 0);
    const dislikes = Number(rows?.[0]?.dislikes ?? 0);
    return { like: likes, dislike: dislikes };
  }

  static async countForMultipleComments(commentIds = []) {
    if (!Array.isArray(commentIds) || commentIds.length === 0) return {};
    const rows = await this.query(
      `SELECT comment_id,
        COUNT(CASE WHEN type='like' THEN 1 END) AS likes,
        COUNT(CASE WHEN type='dislike' THEN 1 END) AS dislikes
       FROM comment_likes
       WHERE comment_id IN (?)
       GROUP BY comment_id`,
      [commentIds]
    );
  
    const map = {};
    for (const r of rows || []) {
      map[r.comment_id] = {
        like: Number(r.likes || 0),
        dislike: Number(r.dislikes || 0),
      };
    }
    return map;
  }

};


module.exports = Like;
