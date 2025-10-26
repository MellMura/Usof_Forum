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
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });;
}

exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    
    if (!email) return res.status(400).json({ error: 'Missing user email' });

    const user = await User.findByEmail(email);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hexToSHA256(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await db.query(
        `UPDATE reset_tokens
        SET used = 1
        WHERE user_id = ?
        AND used = 0
        `, [user.id]
    );

    await db.query(
        `INSERT INTO reset_tokens (user_id, token, expires_at, used)
        VALUES (?, ?, ?, 0)`,
        [user.id, tokenHash, expiresAt]
    );

    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:4000';
    const resetUrl = `${baseUrl}/remind/confirm/${token}`;
    const mailer = buildMailer();

    const mailOption = {
      from: '"Support" <no-reply@example.com>',
      to: user.email,
      subject: 'Password Reset',
      text: `Hello ${user.full_name}, \n\nTo reset your password, click on the link below:\n${resetUrl}\nThis link expires in 30 minutes.`,
      html: `<p>Hello ${user.full_name},</p>
             <p>Use this link to reset your password:</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>
             <p>This link expires in 30 minutes.</p>`
    };

    await mailer.sendMail(mailOption);

    if (process.env.NODE_ENV !== 'production') {
      return res.status(200).json({ message: 'Reset link sent', token, resetUrl });
    }

    return res.status(200).json({ message: 'Password reset link has been sent to your email' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to start password reset' });
  }
};

exports.confirmToken = async (req, res) => {
  try {
    const confirm_token = req.params.confirm_token;
    const { password, passwordConfirm } = req.body || {};

    if (!confirm_token) return res.status(400).json({ error: 'Token is missing '});
    
    if (!password || !passwordConfirm) {
      return res.status(400).json({ error: 'Password and confirmation of the password are required' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const tokenHash = hexToSHA256(confirm_token);
    const [rows]= await db.query(
      `SELECT rt.id, rt.user_id, rt.expires_at, rt.used
      FROM reset_tokens rt
      WHERE rt.token = ?`,
      [tokenHash]
    );

    const rec = rows?.[0];

    if (!rec || rec.used) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    if (new Date(rec.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    await db.query(`UPDATE users SET password = ? WHERE id = ?`, [passwordHash, rec.user_id]);
    await db.query(`UPDATE reset_tokens SET used = 1 WHERE id = ?`, [rec.id]);
    await db.query(`UPDATE reset_tokens SET used = 1 WHERE user_id = ? AND used = 0`, [rec.user_id]);

    return res.status(200).json({ message: 'Password has been reset' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
};
