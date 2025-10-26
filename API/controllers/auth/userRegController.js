const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const db = require('../../db');
const User = require('../../models/User');

function hexToSHA256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}
function buildMailer() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

module.exports = async (req, res) => {
  try {
    const {login, password, passwordConfirm, email, full_name, role = 'user' } = req.body || {};

    if (!login || !password || !passwordConfirm || !email || !full_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ error: 'Passwords do not match'});
    }

    if (await User.findByLogin(login) != null) {
      return res.status(400).json({ error: 'Login already taken' });
    }
  
    if (await User.findByEmail(email) != null) {
      return res.status(400).json({ error: 'E-mail already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = await User.create({ login, passwordHash, full_name, email, status: 'user'});

    const created = await User.findById(id);

    //send verification email
    try {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const namespaced = `verify:${rawToken}`;
      const tokenHash = hexToSHA256(namespaced);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await db.query(
        `INSERT INTO reset_tokens (user_id, token, expires_at, used)
         VALUES (?, ?, ?, 0)`,
        [created.id, tokenHash, expiresAt]
      );
      const baseUrl = process.env.APP_BASE_URL || 'http://localhost:4000';
      const verifyUrl = `${baseUrl}/api/auth/verify-email/${rawToken}`;
      const mailer = buildMailer();
      await mailer.sendMail({
        from: '"Support" <no-reply@example.com>',
        to: created.email,
        subject: 'Please verify your email',
        text: `Hello ${created.full_name},
          Please confirm your email:
          ${verifyUrl}
          This link expires in 30 minutes.`,
                  html: `<p>Hello ${created.full_name},</p>
          <p>Please confirm your email:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>This link expires in 30 minutes.</p>`
      });

      if (process.env.NODE_ENV !== 'production') {
        created._dev_verifyUrl = verifyUrl;
      }
    } catch (mailErr) {
        console.error('Failed to send verification email after register:', mailErr);
    }
    
    if (req.session) {
  	  req.session.user = { id: created.id, login: created.login, status: created.status };
	  }
	  
    return res.status(200).json(created);

  } catch (e) {
    console.error('Register error:', e);
    return res.status(500).json({ error: 'Failed to register' });
  }
};
