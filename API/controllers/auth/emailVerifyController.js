const crypto = require('crypto');
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
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });
}


exports.sendVerification = async (req, res) => {
  try {
    const email = (req.body && req.body.email) || req.user?.email;
    if (!email) return res.status(400).json({ error: 'Missing email' });

    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (Number(user.email_verified) === 1) {
      return res.status(400).json({ error: 'E-mail already verified' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const namespaced = `verify:${rawToken}`;
    const tokenHash = hexToSHA256(namespaced);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);//verification token expires in 30 minutes after sending

    await db.query(
      `INSERT INTO reset_tokens (user_id, token, expires_at, used)
       VALUES (?, ?, ?, 0)`,
      [user.id, tokenHash, expiresAt]
    );

    const baseUrl = 'http://localhost:4000';
    const verifyUrl = `${baseUrl}/api/auth/verify-email/${rawToken}`;

    const mailer = buildMailer();
    await mailer.sendMail({
      from: '"Support" <no-reply@example.com>',
      to: user.email,
      subject: 'Please verify your email',
      text: `Hello ${user.full_name},
        Please confirm your email by opening this link:
        ${verifyUrl}
        This link expires in 30 minutes.`,
      html: `<p>Hello ${user.full_name},</p>
        <p>Please confirm your email by clicking this link:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link expires in 30 minutes.</p>`
    });

    if (process.env.NODE_ENV !== 'production') {
      return res.status(200).json({ message: 'Verification link sent', token: rawToken, verifyUrl });
    }

    return res.status(200).json({ message: 'Verification link sent' });
  } catch (e) {
    console.error('sendVerification error:', e);
    return res.status(500).json({ error: 'Failed to send verification email' });
  }
};

exports.confirmVerification = async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) {
      const fe = process.env.APP_BASE_URL || 'http://localhost:4000';
      return res.redirect(303, `${fe}/verify-email/confirm?status=error`);
    }
    
    const namespaced = `verify:${token}`;
    const tokenHash = hexToSHA256(namespaced);

    const [rows] = await db.query(
      `SELECT id, user_id, expires_at, used
         FROM reset_tokens
        WHERE token = ?`,
      [tokenHash]
    );
    
    const rec = rows?.[0];
    const fe = 'http://localhost:4000';
    
    if (!rec || rec.used || new Date(rec.expires_at) < new Date()) {
      return res.redirect(303, `${fe}/verify-email/confirm?status=error`);
    }

    await db.query(`UPDATE users SET email_verified = 1 WHERE id = ?`, [rec.user_id]);

    await db.query(`UPDATE reset_tokens SET used = 1 WHERE id = ?`, [rec.id]);

    return res.redirect(303, `${fe}/verify-email/confirm?status=ok`);
  } catch (e) {
     const fe = 'http://localhost:4000';
    return res.redirect(303, `${fe}/verify-email/confirm?status=error`);
  }
};

