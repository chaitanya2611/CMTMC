import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Message } from '../models/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

const r = Router();
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { error: 'You have sent several messages already. Please try again in an hour or email us directly.' },
});

// Public: send a message from the contact form
r.post('/', contactLimiter, asyncHandler(async (req, res) => {
  const { name, email, subject, body, website } = req.body || {};
  if (website) return res.status(201).json({ ok: true }); // honeypot: bots fill the hidden field
  await Message.create({ name, email, subject, body });
  res.status(201).json({ ok: true });
}));

// Admin: inbox
r.get('/', requireAdmin, asyncHandler(async (req, res) => {
  res.json(await Message.find().sort({ createdAt: -1 }).limit(500).lean());
}));
r.get('/unread-count', requireAdmin, asyncHandler(async (req, res) => {
  res.json({ count: await Message.countDocuments({ read: false }) });
}));
r.patch('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const doc = await Message.findByIdAndUpdate(req.params.id, { read: Boolean(req.body?.read) }, { new: true });
  if (!doc) throw new HttpError(404, 'Message not found.');
  res.json(doc);
}));
r.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const doc = await Message.findByIdAndDelete(req.params.id);
  if (!doc) throw new HttpError(404, 'Message not found.');
  res.json({ ok: true });
}));

export default r;
