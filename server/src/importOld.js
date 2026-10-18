// Imports the real people and mission text taken from the old CMTMC website,
// and removes the "[placeholder]" people added by the seed.
// Photos live in server/assets/uploads and are served at /uploads/people-*.jpg.
//   npm run import-old            add or update everyone (matched by name)
//   npm run import-old -- --once  do nothing if real people already exist (used on each Render start)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { config } from './config.js';
import { Person, Settings } from './models/index.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const people = JSON.parse(await fs.readFile(path.join(HERE, '..', 'import', 'people.json'), 'utf8'));
const once = process.argv.includes('--once');

await mongoose.connect(config.mongoUri);

if (once && await Person.exists({ name: { $not: /^\[/ } })) {
  console.log('• Real people already in the database, import skipped');
} else {
  const removed = await Person.deleteMany({ name: /^\[/ });
  for (const p of people) {
    await Person.findOneAndUpdate({ name: p.name }, p, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
  }
  await Settings.findOneAndUpdate({ key: 'site' }, {
    mission: 'We systematically decode, validate, and translate traditional medical knowledge into scientifically rigorous, AI-enabled therapeutic innovations that address complex diseases and advance global healthcare.',
  }, { upsert: true });
  console.log(`• Removed ${removed.deletedCount} placeholder people, added/updated ${people.length} people, updated mission`);
}
await mongoose.disconnect();
