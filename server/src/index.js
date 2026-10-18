import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { notFound, errorHandler, asyncHandler } from './middleware/errors.js';
import { requireAdmin } from './middleware/auth.js';
import { crudRouter } from './routes/crud.js';
import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes, { UPLOAD_DIR } from './routes/uploads.js';
import messageRoutes from './routes/messages.js';
import { addDoiRoutes } from './routes/doi.js';
import { Thrust, Platform, Person, Publication, News, Opening, Message } from './models/index.js';

const app = express();
app.set('trust proxy', 1); // behind Render/Railway/Nginx, so rate limits see the real client IP
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, cb) => (!origin || config.clientOrigins.includes(origin) ? cb(null, true) : cb(null, false)),
}));
app.use(express.json({ limit: '1mb' }));
if (!config.isProd) app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));

app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', fallthrough: false }));

app.use('/api/thrusts', crudRouter(Thrust));
app.use('/api/platforms', crudRouter(Platform));
app.use('/api/people', crudRouter(Person));
app.use('/api/publications', crudRouter(Publication, {
  sort: { year: -1, createdAt: -1 },
  extend: addDoiRoutes,
  filter: (req) => {
    const q = {};
    if (req.query.year) q.year = Number(req.query.year);
    if (req.query.featured === 'true') q.featured = true;
    return q;
  },
}));
app.use('/api/news', crudRouter(News, {
  sort: { date: -1 },
  filter: (req) => (req.query.kind ? { kind: req.query.kind } : {}),
}));
app.use('/api/openings', crudRouter(Opening, {
  sort: { isOpen: -1, deadline: 1, createdAt: -1 },
  // Visitors only see open positions; the admin sees everything
  filter: (req, admin) => (admin && req.query.all === 'true' ? {} : { isOpen: true }),
}));

// Dashboard counts for the admin home
app.get('/api/admin/summary', requireAdmin, asyncHandler(async (req, res) => {
  const [thrusts, people, publications, news, openings, unread] = await Promise.all([
    Thrust.countDocuments(), Person.countDocuments(), Publication.countDocuments(),
    News.countDocuments(), Opening.countDocuments({ isOpen: true }), Message.countDocuments({ read: false }),
  ]);
  res.json({ thrusts, people, publications, news, openings, unread });
}));

app.use(notFound);
app.use(errorHandler);

mongoose.set('strictQuery', true);
mongoose.connect(config.mongoUri)
  .then(() => {
    app.listen(config.port, () => console.log(`API listening on http://localhost:${config.port}`));
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });

export default app;
