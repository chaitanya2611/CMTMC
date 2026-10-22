// Imports the real people and approved About-page content,
// and removes any legacy "[placeholder]" people.
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
const siteContent = JSON.parse(await fs.readFile(path.join(HERE, '..', 'import', 'site.json'), 'utf8'));
const once = process.argv.includes('--once');

await mongoose.connect(config.mongoUri);

const currentSettings = await Settings.findOne({ key: 'site' }).select('+aboutContentVersion').lean();
if ((currentSettings?.aboutContentVersion || 0) < siteContent.version) {
  await Settings.findOneAndUpdate({ key: 'site' }, {
    mission: siteContent.mission,
    objectives: siteContent.objectives,
    closingStatement: siteContent.closingStatement,
    aboutContentVersion: siteContent.version,
  }, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
  console.log(`• Updated About-page content to version ${siteContent.version}`);
}

if (once && await Person.exists({ name: { $not: /^\[/ } })) {
  console.log('• Real people already in the database, import skipped');
} else {
  const removed = await Person.deleteMany({ name: /^\[/ });
  for (const p of people) {
    await Person.findOneAndUpdate({ name: p.name }, p, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
  }
  console.log(`• Removed ${removed.deletedCount} placeholder people and added/updated ${people.length} people`);
}
await mongoose.disconnect();
