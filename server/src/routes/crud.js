import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';
import { config } from '../config.js';

const PROTECTED = new Set(['_id', 'createdAt', 'updatedAt', '__v']);

/** Keep only top-level fields that exist on the schema (no mass assignment of _id, timestamps, unknown keys). */
export function pick(Model, body) {
  const allowed = new Set(Object.keys(Model.schema.paths).map((p) => p.split('.')[0]));
  const out = {};
  for (const [k, v] of Object.entries(body || {})) if (allowed.has(k) && !PROTECTED.has(k)) out[k] = v;
  return out;
}

export function isAdminRequest(req) {
  const h = req.get('authorization') || '';
  if (!h.startsWith('Bearer ')) return false;
  try { const p = jwt.verify(h.slice(7), config.jwtSecret); return p.role === 'admin' && p.sub === config.adminEmail; }
  catch { return false; }
}

/**
 * Standard REST routes: public GET list / GET one, admin-only POST / PUT / DELETE.
 * `filter(req, admin)` builds the Mongo query for the list; `sort` orders it.
 */
export function crudRouter(Model, { sort = { order: 1, createdAt: 1 }, filter, extend } = {}) {
  const r = Router();
  if (extend) extend(r);

  r.get('/', asyncHandler(async (req, res) => {
    const admin = isAdminRequest(req);
    const q = filter ? filter(req, admin) : {};
    const limit = Math.min(Number(req.query.limit) || 500, 500);
    res.json(await Model.find(q).sort(sort).limit(limit).lean());
  }));

  r.get('/:id', asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id).lean();
    if (!doc) throw new HttpError(404, 'Not found.');
    res.json(doc);
  }));

  r.post('/', requireAdmin, asyncHandler(async (req, res) => {
    res.status(201).json(await Model.create(pick(Model, req.body)));
  }));

  r.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, pick(Model, req.body), { new: true, runValidators: true });
    if (!doc) throw new HttpError(404, 'Not found.');
    res.json(doc);
  }));

  r.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw new HttpError(404, 'Not found.');
    res.json({ ok: true });
  }));

  // Bulk reorder: body = { ids: [id1, id2, ...] } in display order
  if (Model.schema.paths.order) {
    r.post('/reorder', requireAdmin, asyncHandler(async (req, res) => {
      const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
      await Model.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { order: i } } })));
      res.json({ ok: true });
    }));
  }
  return r;
}
