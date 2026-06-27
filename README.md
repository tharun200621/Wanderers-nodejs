# Wanderlust 🧭

A full-stack accommodation-rental platform inspired by Airbnb, built with the Node.js / Express / MongoDB stack. Users can browse and search stays, filter by category, view interactive maps, create and manage their own listings, and leave reviews — backed by a complete authentication system with email verification and persistent login.

> Built as a portfolio project to demonstrate full-stack web development: server-side rendering, REST-style routing, authentication & authorization, third-party API integration, and cloud deployment.

---

## ✨ Features

- **Listings CRUD** — create, read, update, and delete property listings, with ownership-based authorization (only the owner can edit/delete).
- **Search & category filters** — full-text search across title, location, and country, plus filtering by category (Trending, Mountains, Castles, etc.).
- **Reviews & ratings** — authenticated users can post star-rated reviews; only the author can delete their own.
- **Authentication** — sign up / log in / log out via Passport.js with session management stored in MongoDB.
- **Email OTP verification** — new accounts verify their email with a 6-digit code sent over SMTP (Nodemailer + Gmail), with hashed codes, expiry, and attempt limits.
- **Persistent "remember me" login** — a secure, hashed token cookie keeps users logged in across browser sessions for 30 days.
- **Image uploads** — listing photos are uploaded to and served from Cloudinary.
- **Interactive maps** — each listing geocodes its location (OpenStreetMap / Nominatim) and renders a Leaflet map marker.
- **Server-side validation** — request bodies validated with Joi; centralized async error handling and a custom error page.
- **Responsive dark UI** — custom design system layered over Bootstrap 5.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Server | Express 5 |
| Database | MongoDB + Mongoose |
| Templating | EJS + ejs-mate (server-side rendering) |
| Auth | Passport.js (local strategy), express-session, connect-mongo |
| Email | Nodemailer (Gmail SMTP) |
| Image storage | Cloudinary + Multer |
| Maps / Geocoding | Leaflet + OpenStreetMap Nominatim |
| Validation | Joi |
| Styling | Bootstrap 5 + custom CSS |

---

## 🏗 Architecture

The app follows an **MVC structure**:

```
app.js                 # Entry point: middleware, sessions, passport, routes, error handling
MODELS/                # Mongoose schemas (User, Listing, Review)
controllers/           # Route handler logic (listings, reviews, users)
routes/                # Express routers (listing, review, user)
views/                 # EJS templates (layouts, listings, users, includes)
middleware.js          # Auth guards, ownership checks, validation, remember-me
utils/                 # Mailer, token/OTP helpers, async wrapper, error class, geocoding
public/                # Static CSS / JS
init/                  # Database seed script
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database (local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- A [Cloudinary](https://cloudinary.com/) account (free tier) for image uploads
- *(Optional)* A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) to send real verification emails

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
#    then fill in the values in .env

# 3. (Optional) Seed the database with sample listings
node init/index.js

# 4. Run the app
npm run dev      # development, auto-restarts on changes (nodemon)
# or
npm start        # production
```

The app runs at **http://localhost:8080**.

> **Email in development:** if `SMTP_EMAIL` / `SMTP_APP_PASSWORD` are left blank, OTP codes are printed to the server console instead of being emailed — so you can test signup without any SMTP setup.

---

## 🔐 Environment Variables

See [`.env.example`](.env.example) for the full list. Key variables:

| Variable | Purpose |
|----------|---------|
| `ATLASDB_URL` | MongoDB connection string (falls back to local) |
| `SECRET` | Session signing & store-encryption secret |
| `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` | Cloudinary credentials |
| `SMTP_EMAIL`, `SMTP_APP_PASSWORD` | Gmail SMTP for OTP emails (optional in dev) |
| `PORT` | Port to listen on (set automatically by most hosts) |
| `NODE_ENV` | Set to `production` when deployed |

---

## ☁️ Deployment (Render)

1. Push the repo to GitHub.
2. On [Render](https://render.com), create a **New Web Service** from the repo.
3. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
4. Add all environment variables from `.env.example` in the Render dashboard, including `NODE_ENV=production` and your `ATLASDB_URL` (an Atlas cluster, since the host has no local MongoDB).
5. Deploy.

---

## 🔒 Security Notes

- Passwords are hashed with PBKDF2 (via `passport-local-mongoose`) — never stored in plaintext.
- OTP codes and remember-me tokens are SHA-256 hashed before storage; only the hash lives in the database.
- Sessions are stored server-side in MongoDB, not in the cookie.
- Secrets are kept out of version control via `.gitignore`.

---

## 📌 Possible Future Improvements

- Booking / reservation flow with availability calendar
- Rate limiting on auth endpoints
- Pagination for the listings grid
- Automated tests (Jest / Supertest)
