import { Router } from 'express';
import { Settings } from '../models/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errors.js';
import { pick } from './crud.js';

const r = Router();

async function getSettings() {
  return (await Settings.findOne({ key: 'site' }).lean()) || (await Settings.create({ key: 'site' })).toObject();
}

r.get('/', asyncHandler(async (req, res) => res.json(await getSettings())));

r.put('/', requireAdmin, asyncHandler(async (req, res) => {
  const body = pick(Settings, req.body);
  delete body.key;
  delete body.aboutContentVersion;
  const doc = await Settings.findOneAndUpdate({ key: 'site' }, body, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
  res.json(doc);
}));

export default r;
