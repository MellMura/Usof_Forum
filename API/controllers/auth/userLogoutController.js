module.exports = (_req, res) => {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth',
  });
  return res.status(204).end();
};
