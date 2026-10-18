import 'dotenv/config';

const required = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH', 'JWT_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}. Copy server/.env.example to server/.env and fill them in.`);
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' && (process.env.JWT_SECRET || '').length < 32) {
  console.error('JWT_SECRET must be at least 32 characters in production.');
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  isProd: process.env.NODE_ENV === 'production',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  mongoUri: process.env.MONGODB_URI,
  adminEmail: process.env.ADMIN_EMAIL.trim().toLowerCase(),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cloudinaryUrl: process.env.CLOUDINARY_URL || '',
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || 'cmtmc',
  // In production the site and API share one origin, so upload links can be relative (/uploads/...)
  publicApiUrl: (process.env.PUBLIC_API_URL ?? (process.env.NODE_ENV === 'production' ? '' : `http://localhost:${process.env.PORT || 5000}`)).replace(/\/$/, ''),
  crossrefMailto: process.env.CROSSREF_MAILTO || process.env.ADMIN_EMAIL,
};
