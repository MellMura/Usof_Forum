const Block = require('../models/Block');
const User = require('../models/User');

const toInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
};

exports.blockUser = async (req, res) => {
  try {
    const me = req.user?.id;
    const targetId = toInt(req.params.targetId);

    if (!me) return res.status(400).json({ error: 'Not authenticated' });
    if (!Number.isInteger(targetId) || targetId <= 0) {
      return res.status(400).json({ error: 'Invalid target user id' });
    }

    if (me === targetId) {
      return res.status(400).json({ error: 'You cannot block yourself' });
    }

    const target = await User.findById?.(targetId);
    if (User.findById && !target) {
      return res.status(404).json({ error: 'User not found' });
    }

    await Block.block({ blocker_id: me, blocked_id: targetId });

    return res.status(200).json({ blocked: true, target_id: targetId });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to block user' });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const me = req.user?.id;
    const targetId = toInt(req.params.targetId);

    if (!me) return res.status(400).json({ error: 'Not authenticated' });

    if (!Number.isInteger(targetId) || targetId <= 0) {
      return res.status(400).json({ error: 'Invalid target user id' });
    }

    await Block.unblock({ blocker_id: me, blocked_id: targetId });
    return res.status(200).json({ blocked: false, target_id: targetId });
  } catch (e) {
    console.error('unblockUser error:', e);
    return res.status(500).json({ error: 'Failed to unblock user' });
  }
};


//only gives ids
exports.listMyBlocks = async (req, res) => {
  try {
    const me = req.user?.id;
    if (!me) return res.status(400).json({ error: 'Not authenticated' });

    const ids = await Block.getBlockedUsers(me);

    return res.json(ids);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to list blocked users' });
  }
};


exports.listWhoBlockedMe = async (req, res) => {
  try {
    const me = req.user?.id;
    if (!me) return res.status(401).json({ error: 'Not authenticated' });

    const ids = await Block.listBlockers(me);
    return res.json(ids);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to list blockers' });
  }
};


//get every information about who is blocked 
exports.getBlockStatus = async (req, res) => {
  try {
    const me = req.user?.id;
    const targetId = toInt(req.params.targetId);

    if (!me) return res.status(400).json({ error: 'Not authenticated' });

    if (!Number.isInteger(targetId) || targetId <= 0) {
      return res.status(400).json({ error: 'Invalid target user id' });
    }

    const target = await User.findById?.(targetId);
    if (User.findById && !target) {
      return res.status(404).json({ error: 'User not found' });
    }

    const myBlockees = await Block.getBlockedUsers(me);
    const myBlockers = await Block.listBlockers(me);

    const iBlockTarget = myBlockees.includes(targetId);
    const targetBlocksMe = myBlockers.includes(targetId);

    return res.json({
      blocked_by_me: iBlockTarget,
      blocked_me: targetBlocksMe,
      blocked_either: iBlockTarget || targetBlocksMe,
      target_id: targetId,
    });
  } catch (e) {
    console.error('getBlockStatus error:', e);
    return res.status(500).json({ error: 'Failed to get block status' });
  }
};

//gives all main infos on the user
exports.getBlockList = async (req, res) => {
  try {
    const me = req.user?.id;
    if (!me) return res.status(400).json({ error: 'Not authenticated' });

    const blockedIds = await Block.getBlockedUsers(me);
    if (!blockedIds.length) {
      return res.json([]);
    }

    const placeholders = blockedIds.map(() => '?').join(', ');
    const rows = await User.query(
      `SELECT id, login, full_name, pic_url, status, rating, elo
         FROM users
        WHERE id IN (${placeholders})`,
      blockedIds
    );

    const profiles = Array.isArray(rows) ? rows : [];

    return res.json(profiles);
  } catch (e) {
    console.error('getBlockList error:', e);
    return res.status(500).json({ error: 'Failed to fetch block list' });
  }
};

