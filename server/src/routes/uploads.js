import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

export const UPLOAD_DIR = path.resolve('uploads');
const useCloudinary = Boolean(config.cloudinaryUrl);
if (useCloudinary) cloudinary.config({ secure: true }); // reads CLOUDINARY_URL from the environment

const TYPES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => (TYPES[file.mimetype] ? cb(null, true) : cb(new HttpError(400, 'Upload a JPG, PNG, WebP or GIF image.'))),
});

// Check magic bytes so a renamed non-image can't slip through on its claimed mimetype
function looksLikeImage(buf) {
  const hex = buf.subarray(0, 12).toString('hex');
  return hex.startsWith('ffd8ff') || hex.startsWith('89504e47') || hex.startsWith('47494638')
    || (hex.startsWith('52494646') && buf.subarray(8, 12).toString() === 'WEBP');
}

const r = Router();

r.post('/', requireAdmin, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Choose an image to upload.');
  if (!looksLikeImage(req.file.buffer)) throw new HttpError(400, 'That file is not a valid image.');

  if (useCloudinary) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: config.cloudinaryFolder, resource_type: 'image', transformation: [{ width: 1600, height: 1600, crop: 'limit' }] },
        (err, out) => (err ? reject(err) : resolve(out)),
      ).end(req.file.buffer);
    });
    return res.status(201).json({ url: result.secure_url });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${TYPES[req.file.mimetype]}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), req.file.buffer);
  res.status(201).json({ url: `${config.publicApiUrl}/uploads/${name}` });
}));

export default r;
