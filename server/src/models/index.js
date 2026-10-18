import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const str = (max = 300, extra = {}) => ({ type: String, trim: true, maxlength: max, default: '', ...extra });
const url = { type: String, trim: true, maxlength: 1000, default: '',
  validate: { validator: (v) => !v || /^https?:\/\/\S+$/i.test(v) || v.startsWith('/uploads/'), message: 'Links must start with http:// or https://' } };
const opts = { timestamps: true, toJSON: { versionKey: false } };

/* ---------- site settings (one document) ---------- */
const settingsSchema = new Schema({
  key: { type: String, default: 'site', unique: true, immutable: true },
  shortName: str(40), name: str(200), tagline: str(200),
  heroTitle: str(200), heroText: str(1000),
  about: str(4000), aboutMore: str(4000),
  mission: str(1000), vision: str(1000),
  joinText: str(1500),
  email: str(200), phone: str(60), address: str(500),
  social: {
    linkedin: url, twitter: url, github: url, youtube: url,
  },
  stats: [{ _id: false, value: str(20), label: str(80) }],
  pipeline: [{ _id: false, title: str(60), text: str(400) }],
  partners: [{ _id: false, name: str(120), link: url }],
}, opts);
export const Settings = model('Settings', settingsSchema);

/* ---------- content collections ---------- */
export const TAGS = ['AI/ML', 'Chemistry', 'Biology'];
export const Thrust = model('Thrust', new Schema({
  title: str(160, { required: [true, 'Title is required'] }),
  tag: { type: String, enum: TAGS, default: 'Biology' },
  summary: str(600), details: str(5000),
  keywords: [str(60)],
  image: url,
  order: { type: Number, default: 0 },
}, opts));

export const Platform = model('Platform', new Schema({
  name: str(120, { required: [true, 'Name is required'] }),
  kind: { type: String, enum: ['Database', 'Model', 'Tool', 'Dataset'], default: 'Tool' },
  status: { type: String, enum: ['Planned', 'Beta', 'Live'], default: 'Planned' },
  text: str(1000), link: url,
  order: { type: Number, default: 0 },
}, opts));

export const PEOPLE_GROUPS = ['Faculty', 'Scientists & postdocs', 'PhD students', 'MTech & MSc students', 'Undergraduate researchers', 'Project staff', 'Alumni'];
export const Person = model('Person', new Schema({
  name: str(120, { required: [true, 'Name is required'] }),
  role: str(160), group: { type: String, enum: PEOPLE_GROUPS, default: 'Faculty' },
  bio: str(1500), interests: [str(60)],
  photo: url, email: str(200), profileLink: url, scholarLink: url,
  order: { type: Number, default: 0 },
}, opts));

export const Publication = model('Publication', new Schema({
  title: str(500, { required: [true, 'Title is required'] }),
  authors: str(1500), venue: str(300),
  year: { type: Number, min: 1900, max: 2100 },
  doi: { type: String, trim: true, lowercase: true, maxlength: 200, default: '' },
  link: url,
  featured: { type: Boolean, default: false },
}, opts));

export const News = model('News', new Schema({
  title: str(200, { required: [true, 'Title is required'] }),
  kind: { type: String, enum: ['News', 'Event', 'Seminar', 'Award'], default: 'News' },
  date: { type: Date, default: Date.now },
  venue: str(200), text: str(5000), image: url, link: url,
}, opts));

export const Opening = model('Opening', new Schema({
  title: str(200, { required: [true, 'Title is required'] }),
  type: { type: String, enum: ['PhD', 'JRF / SRF', 'Postdoc', 'Project staff', 'Internship'], default: 'PhD' },
  description: str(5000), eligibility: str(3000),
  deadline: { type: Date },
  applyLink: url, contactEmail: str(200),
  isOpen: { type: Boolean, default: true },
}, opts));

export const Message = model('Message', new Schema({
  name: str(120, { required: [true, 'Please enter your name'] }),
  email: str(200, { required: [true, 'Please enter your email'], match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] }),
  subject: str(200),
  body: str(5000, { required: [true, 'Please write a message'] }),
  read: { type: Boolean, default: false },
}, opts));
