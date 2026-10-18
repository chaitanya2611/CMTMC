// Fills an empty database with starter content. Safe to re-run: it skips collections that already have data.
// Usage: npm run seed            (add --force to wipe and re-seed content collections)
import mongoose from 'mongoose';
import { config } from './config.js';
import { Settings, Thrust, Platform, Person, Publication, News, Opening } from './models/index.js';

const force = process.argv.includes('--force');

const settings = {
  key: 'site',
  shortName: 'CMTMC',
  name: 'Centre for Machine Learning–Driven Traditional Medicine and Catalysis',
  tagline: 'AI/ML × Chemistry × Biology',
  heroTitle: 'Traditional medicine, read by machines and made by catalysts',
  heroText: 'We bring machine learning, computational chemistry and molecular biology together to turn centuries of traditional-medicine knowledge into validated molecules, and to design the catalysts that make them sustainably.',
  about: 'Traditional systems such as Ayurveda, Siddha, Unani and Traditional Chinese Medicine describe thousands of plant preparations, but most of their active molecules, targets and mechanisms remain uncharacterised. Making those molecules at scale is a second, separate chemistry problem.',
  aboutMore: 'The centre treats both as one data problem. We build knowledge graphs from classical texts and phytochemical databases, train models that link molecular structure to biological activity, and use machine learning to design chemical and enzymatic catalysts for green synthesis, then test the best candidates in the lab.',
  mission: 'Turn traditional-medicine knowledge into validated, sustainably made molecules using machine learning.',
  vision: 'A world where every traditional remedy can be traced to its molecules, targets and evidence.',
  joinText: 'We welcome PhD students, postdoctoral fellows, project staff and visiting researchers. Write to us with your CV and a short note on the problem you would like to work on.',
  email: 'contact@your-centre.example',
  phone: '',
  address: 'Add your department, institute and campus address from the admin panel.',
  stats: [
    { value: '4', label: 'Research thrusts' },
    { value: '3', label: 'Disciplines in one team' },
    { value: '5', label: 'Stages from text to molecule' },
    { value: '3', label: 'Open platforms in development' },
  ],
  pipeline: [
    { title: 'Curate', text: 'Digitise classical formulations, ethnobotany and phytochemical records into a linked knowledge graph.' },
    { title: 'Represent', text: 'Encode plants, compounds and targets as molecular graphs, fingerprints and protein embeddings.' },
    { title: 'Predict', text: 'Train GNNs and generative models for activity, ADMET, targets and synthesis routes.' },
    { title: 'Make', text: 'Design catalysts and biocatalytic routes to synthesise and diversify the top scaffolds.' },
    { title: 'Validate', text: 'Test candidates in assays and feed every result back to retrain the models.' },
  ],
  partners: [],
};

const thrusts = [
  { title: 'Traditional-medicine knowledge graphs', tag: 'Biology', summary: 'Mining classical texts and phytochemical databases into graphs that connect plants, formulations, compounds, protein targets and indications.', keywords: ['ethnopharmacology', 'NLP', 'network pharmacology'] },
  { title: 'AI for natural-product drug discovery', tag: 'AI/ML', summary: 'Graph neural networks, docking and ADMET models that prioritise natural-product scaffolds and propose drug-like analogues against disease targets.', keywords: ['GNNs', 'virtual screening', 'generative design'] },
  { title: 'Machine-learning-guided catalysis', tag: 'Chemistry', summary: 'Learning adsorption energies, reaction barriers and selectivity to design homogeneous, heterogeneous and enzymatic catalysts faster than DFT alone.', keywords: ['DFT surrogates', 'active learning', 'ΔG‡'] },
  { title: 'Biocatalysis and green synthesis', tag: 'Biology', summary: 'Engineering enzymes and sustainable reaction routes to produce and diversify plant-derived bioactives at scale.', keywords: ['enzyme engineering', 'retrosynthesis', 'flow chemistry'] },
].map((t, i) => ({ ...t, order: i }));

const platforms = [
  { name: 'TM-Graph', kind: 'Database', status: 'Planned', text: 'A searchable knowledge graph linking traditional formulations, plants, phytochemicals and protein targets.' },
  { name: 'PhytoScreen', kind: 'Model', status: 'Planned', text: 'Pretrained models that score natural products for target activity and ADMET in one pass.' },
  { name: 'CatML', kind: 'Tool', status: 'Planned', text: 'Active-learning workflows that propose the next catalyst to compute or test.' },
].map((p, i) => ({ ...p, order: i }));

const people = [
  { name: '[Centre Head]', role: 'Professor & Head', group: 'Faculty', bio: 'Replace with name, photo and a short bio from the admin panel.', interests: ['ML for chemistry'] },
  { name: '[Faculty member]', role: 'Associate Professor', group: 'Faculty', bio: 'Computational chemistry and catalysis.', interests: ['DFT', 'catalysis'] },
  { name: '[Faculty member]', role: 'Assistant Professor', group: 'Faculty', bio: 'Machine learning for molecular biology.', interests: ['GNNs', 'protein targets'] },
  { name: '[Student]', role: 'PhD scholar', group: 'PhD students', bio: 'Natural-product virtual screening.', interests: ['docking'] },
].map((p, i) => ({ ...p, order: i }));

const publications = [
  { title: '[Paper title — add publications from the admin panel, or import them by DOI]', authors: '[Authors]', venue: '[Journal or conference]', year: new Date().getFullYear() },
];

const news = [
  { title: 'Our new website is live', kind: 'News', date: new Date(), text: 'Follow this page for research highlights, seminars and open positions.' },
];

const openings = [
  { title: '[Example] PhD position in ML for natural-product discovery', type: 'PhD', description: 'Replace this example with a real opening from the admin panel, or close it.', eligibility: 'Master’s degree in chemistry, biology, pharmacy, computer science or a related field.', isOpen: true },
];

async function seedCollection(Model, rows, label) {
  const n = await Model.countDocuments();
  if (n && !force) return console.log(`• ${label}: already has ${n} item(s), skipped`);
  if (force) await Model.deleteMany({});
  await Model.insertMany(rows);
  console.log(`• ${label}: added ${rows.length}`);
}

await mongoose.connect(config.mongoUri);
const existing = await Settings.findOne({ key: 'site' });
if (!existing || force) {
  await Settings.findOneAndUpdate({ key: 'site' }, settings, { upsert: true });
  console.log('• Settings: written');
} else console.log('• Settings: already set, skipped');
await seedCollection(Thrust, thrusts, 'Research thrusts');
await seedCollection(Platform, platforms, 'Platforms');
await seedCollection(Person, people, 'People');
await seedCollection(Publication, publications, 'Publications');
await seedCollection(News, news, 'News');
await seedCollection(Opening, openings, 'Openings');
await mongoose.disconnect();
console.log('Done.');
