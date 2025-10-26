const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  try {
    const { login, email, password } = req.body || {};

    if (!login || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userFound = await User.findAuthByLogin(login);

    if (!userFound) {
      return res.status(400).json({ error: 'Credentials do not match' });
    }

    if (String(userFound.email).toLowerCase() !== String(email).toLowerCase()) {
      return res.status(400).json({ error: 'Credentials do not match' });
    }

    const ok = bcrypt.compareSync(password, userFound.password);

    if (!ok) return res.status(400).json({ error: 'Credentials do not match' });

    if (Number(userFound.email_verified) !== 1) {
      return res.status(400).json({ error: 'E-mail not verified' });
    }

    const payload = { id: userFound.id, login: userFound.login, status: userFound.status };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    return res.status(200).json({ user: payload, accessToken });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Failed to login' });
  }
};
