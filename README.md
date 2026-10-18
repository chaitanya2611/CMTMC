# CMTMC website

Website for the **Centre for Machine Learning–Driven Traditional Medicine and Catalysis**, built on the MERN stack:

- **MongoDB** (Mongoose) stores all content
- **Express** API with a single admin login (bcrypt-hashed password + JWT)
- **React** (Vite + React Router) public site and admin panel
- **Node.js** 18.18 or newer

## What's included

**Public pages:** Home, About, Research, People, Publications, News & events (with detail pages), Openings and Contact.

**Admin panel** at `/admin`:

| Section | What the admin can do |
|---|---|
| Site settings | Centre name, home-page headline, about text, mission and vision, contact details, social links, key figures, project steps, partners |
| Research thrusts | Add, edit, reorder and delete; set the lead discipline (AI/ML, Chemistry or Biology), keywords and an image |
| Platforms | Databases, models and tools with a status (Planned, Beta or Live) |
| People | Photo upload, group (Faculty, PhD students and so on), bio, interests, profile and Google Scholar links, display order |
| Publications | **Import by DOI**: paste a DOI and title, authors, journal and year are filled in from Crossref. Mark papers as featured. |
| News & events | News, events, seminars and awards, with date, venue, image and link |
| Openings | PhD, JRF/SRF, postdoc, project-staff and internship positions with deadlines. Untick "Show on the website" to close one. |
| Messages | Inbox for the contact form, with unread count, mark as read, reply by email and delete |

**Security measures:**
- Login is rate-limited to 10 attempts per 15 minutes.
- The contact form is rate-limited and has a hidden honeypot field to catch bots.
- Uploads are checked by type, size and file signature.
- The API only accepts fields defined in each model.
- Helmet security headers and a CORS allow-list are enabled.

## Run it locally

You need Node.js 18.18+ and a MongoDB database: either [MongoDB Community](https://www.mongodb.com/try/download/community) on your machine, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
git clone https://github.com/chaitanya2611/cmtmc.git
cd cmtmc
npm run install:all

# 1. Configure the API
cp server/.env.example server/.env
cd server
npm run hash-password -- "choose-a-strong-password"   # copy the printed line into server/.env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # paste as JWT_SECRET
# also set MONGODB_URI and ADMIN_EMAIL in server/.env
cd ..

# 2. Add starter content (safe to re-run; it skips collections that already have data)
npm run seed

# 3. Start the API (port 5000) and the website (port 5173) together
npm run dev
```

Open http://localhost:5173 for the site and http://localhost:5173/admin to sign in.

The seed adds placeholder content in square brackets, such as `[Centre Head]`. Replace it from the admin panel before going live.

## Deploy

Deploy the API and the website separately. Two easy options:

### Option A: Render (both parts, one click)
1. Create a free MongoDB Atlas cluster and copy its connection string.
2. In Render choose **New → Blueprint**, select this repository, and Render reads `render.yaml`.
3. Fill in the values it asks for:
   - `MONGODB_URI`: your Atlas connection string
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`: from `npm run hash-password`. On Render, paste the hash **without** the quotes.
   - `CLIENT_ORIGIN`: the website's URL, e.g. `https://cmtmc-web.onrender.com`
   - `PUBLIC_API_URL`: the API's URL, e.g. `https://cmtmc-api.onrender.com`
   - `VITE_API_URL` (static site): the API's URL
   - `CLOUDINARY_URL`: see the note on images below
4. Run the seed once from the API service's **Shell** tab: `npm run seed`.

### Option B: Vercel (website) + Render or Railway (API)
- **Website:** import the repo into Vercel with root directory `client` and set `VITE_API_URL`. `client/vercel.json` already handles page routing.
- **API:** deploy `server` as a Node service with the environment variables listed in `server/.env.example`.

### Images in production
Without `CLOUDINARY_URL`, uploads are saved to `server/uploads`. Most free hosts **wipe that folder on every redeploy**, so in production create a free [Cloudinary](https://cloudinary.com) account and set `CLOUDINARY_URL`. Uploads then go to Cloudinary automatically; no code changes are needed.

## Project structure

```
server/
  src/index.js          Express app and routes
  src/models/           Mongoose models (Settings, Thrust, Platform, Person, Publication, News, Opening, Message)
  src/routes/           auth, settings, uploads, contact messages, DOI lookup, generic CRUD
  src/seed.js           starter content
client/
  src/pages/            public pages
  src/admin/            admin panel (forms are generated from admin/schemas.js)
  src/components/       layout, leaf illustration, shared UI
  src/styles/           site.css (public look) and admin.css
```

### Adding a field
To add a field, for example an ORCID link for people:
1. Add it to the model in `server/src/models/index.js`.
2. Add it to the matching entry in `client/src/admin/schemas.js`; the admin form picks it up automatically.
3. Show it on the relevant public page in `client/src/pages/`.

## API overview

| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/login` | public (rate-limited) |
| GET | `/api/settings`, `/api/thrusts`, `/api/platforms`, `/api/people`, `/api/publications`, `/api/news`, `/api/openings` | public |
| POST / PUT / DELETE | the same collections (`/:id` for PUT and DELETE) | admin |
| POST | `/api/<collection>/reorder` with `{ ids: [...] }` | admin |
| GET | `/api/publications/doi/lookup?doi=…` | admin |
| POST | `/api/uploads` (multipart `file`) | admin |
| POST | `/api/messages` | public (rate-limited) |
| GET / PATCH / DELETE | `/api/messages` | admin |
| GET | `/api/admin/summary` | admin |
