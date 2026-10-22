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

# 2. Start the API (port 5000) and the website (port 5173) together
npm run dev
```

Open http://localhost:5173 for the site and http://localhost:5173/admin to sign in.

Content collections start empty. Add site settings, research, publications, news and opportunities through the admin panel.
