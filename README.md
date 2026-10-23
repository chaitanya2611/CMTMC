# CMTMC website

Website for the **Center for Machine Learning–Driven Traditional Medicine and Catalysis**, built on the MERN stack:

- **MongoDB** (Mongoose) stores all content
- **Express** API with a single admin login (bcrypt-hashed password + JWT)
- **React** (Vite + React Router) public site and admin panel
- **Node.js** 18.18 or newer

## What's included

**Public pages:** Home, About, Research, People, Publications, News & events (with detail pages), Openings and Contact.

**Admin panel** at `/admin`:

| Section | What the admin can do |
|---|---|
| Site settings | Center name, home-page headline, about text, mission, objectives, contact details, social links, key figures, project steps, partners |
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

# 2. Start the API (port 5000) and the website (port 5173) together
npm run dev
```

Open http://localhost:5173 for the site and http://localhost:5173/admin to sign in.

Content collections start empty. Add site settings, research, publications, news and opportunities through the admin panel.

## Deploy

Deploy the API and the website separately. Two easy options:

### Option A: Render (recommended, one service)
`render.yaml` runs the API and serves the built React site from one free web service, so there is a single URL and no CORS setup.
1. Create a free MongoDB Atlas cluster. Under **Network Access** allow `0.0.0.0/0`, then copy the connection string.
2. In Render choose **New → Blueprint** and select this repository.
3. Fill in `MONGODB_URI` (Atlas string) and `ADMIN_PASSWORD_HASH` (from `npm run hash-password`, pasted **without** quotes).
4. On every start the service loads the real people from `server/import/people.json` once, so no shell step is needed. Other content remains under admin control.

Notes: photos uploaded from the admin panel are stored on the service's disk, which Render's free plan wipes on each deploy. Set `CLOUDINARY_URL` to keep them. Photos imported from the old site live in `server/assets/uploads` and are always kept.

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
