const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.optionalAuth = async function optionalAuth(req, _res, next) {
  try {
    const auth = req.headers.authorization || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    const token = m?.[1];
    if (!token) return next();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (user) req.user = { id: user.id, login: user.login, status: user.status };
  } catch (_) {
  }
  next();
};

function getToken (req) {
  const header = req.headers['authorization'] || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies?.access_token) return req.cookies.access_token;
  return null;  
}

exports.requireAuth = (req, res, next) => {
  try {
    const token = getToken(req);
    //const header = req.headers.authorization || '';
   //console.log('Auth header:', header);
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, login: payload.login, status: payload.status };
    //console.log('req.user ->', req.user);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

exports.requireAdmin = (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) return res.status(401).json({ error: 'No token provided' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.status !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.user = { id: payload.id, login: payload.login, status: payload.status };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

exports.refresh = (req, res) => {
  try {
    const rt = req.cookies?.refresh_token;
    if (!rt) return res.status(401).json({ error: 'No refresh token' });

    const payload = jwt.verify(rt, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      { id: payload.id, login: payload.login, status: payload.status },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    return res.json({ accessToken });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};
