import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errors.js';

const r = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Wait 15 minutes and try again.' },
});

r.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  // Always run bcrypt so response time doesn't reveal whether the email matched
  const ok = await bcrypt.compare(password, config.adminPasswordHash);
  if (!ok || email !== config.adminEmail) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  const token = jwt.sign({ sub: config.adminEmail, role: 'admin' }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  res.json({ token, email: config.adminEmail });
}));

r.get('/me', requireAdmin, (req, res) => res.json({ email: req.admin.sub }));

export default r;
