const User = require('../../models/User');

module.exports = async (req, res) => {
  try {
    const me = await User.findById(req.user.id);

    if (!me) return res.status(404).json({ error: 'User not found' });
    return res.json(me);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch current user' });
  }
};
