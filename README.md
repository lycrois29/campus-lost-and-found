# CampusFind — Campus Lost & Found

CampusFind is a complete Next.js + TypeScript + MongoDB lost-and-found application for a university assignment. It uses App Router pages, REST route handlers, Mongoose models, and an HTTP-only JWT cookie for authentication.

**Team import in progress:** this first commit contains the shared foundation only. The student and admin modules will arrive in separate pull requests. Do not build or deploy this repository until both have been merged; the existing live site is separate.

New student registration accepts `@au.edu` addresses but does **not** prove email ownership. New accounts remain blocked until an Admin verifies the student's identity through an official university channel and approves them at `/admin/verify`. Existing accounts created before this rule remain active and should be reviewed manually. Rotate exposed credentials, establish tested backups, and obtain school privacy approval before using real student records.

## Live deployment

The application is running at [campus-lost-found-beta-eight.vercel.app](https://campus-lost-found-beta-eight.vercel.app/). Its production environment uses the separate **CampusFind** MongoDB Atlas project and the `campus_lost_found` database. A first Admin account and six starter categories have already been created. The Admin credentials are not stored in this repository. Rotate the previously shared Admin password through `/account` after signing in.

The local `.env.local` is **not** populated with the production database secret. To run the site locally against Atlas, add a valid Atlas connection string and a local JWT secret to `.env.local` first. Alternatively, use a local MongoDB server as shown below.

## Requirements

- Node.js 18.18 or newer
- MongoDB running locally or a MongoDB Atlas connection string

## Install and configure

From this project folder:

```powershell
npm install
Copy-Item .env.example .env.local
```

Open `.env.local` and set:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/campus_lost_found
JWT_SECRET=replace-with-a-long-random-secret
STUDENT_EMAIL_DOMAIN=au.edu
ADMIN_NAME=Campus Administrator
ADMIN_EMAIL=admin@campus.local
ADMIN_PASSWORD=replace-with-a-unique-password-of-at-least-12-characters
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string. Do not commit `.env.local` or place real secrets in `.env.example`.

## Create the first admin account

The seed is idempotent: it creates the admin if missing, updates the configured admin password if it already exists, and ensures starter categories exist. The live deployment's Admin account already exists; only run this command against it if you intentionally want to change that account's password.

```powershell
npm run seed:admin
```

The admin can then log in through the normal `/login` page using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Deploy directly to Vercel

This project can be deployed without a Git repository. Create a MongoDB Atlas cluster and database user, then add the production environment variables to the linked Vercel project:

```powershell
vercel env add MONGODB_URI production --sensitive
vercel env add JWT_SECRET production --sensitive
vercel deploy --prod
```

The Atlas network access list must allow the deployed app to connect. Seed the first admin and starter categories against the same Atlas connection by setting `MONGODB_URI`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` locally, then running `npm run seed:admin`. Do not upload the admin password to Vercel; it is only used by the seed command. For a direct CLI deployment, install Vercel CLI with `npm install -g vercel` and run `vercel login` and `vercel link` first.

## Run locally

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify and run production mode

```powershell
npm run lint
npm test
npm run build
npm start
```

## Main routes

- `/` — landing page
- `/browse` — public approved-item search and filters
- `/dashboard` — student workspace
- `/reports/new` — create a lost/found report
- `/my-reports` — edit or delete your reports
- `/claims` — submit tracking and status for claims
- `/admin` — admin dashboard for reports, claims, categories, users, and statistics

## REST API groups

The Admin can verify students at `/admin/verify`, review all paginated reports at `/admin/reports`, review all paginated claims at `/admin/claims`, and change their password at `/account`.

- `/api/auth/*` — register, login, logout, and current session
- `/api/items` and `/api/items/:id` — item CRUD and moderation status
- `/api/claims` and `/api/claims/:id` — claim CRUD and review status
- `/api/categories` and `/api/categories/:id` — category CRUD
- `/api/admin/stats` and `/api/admin/users/*` — admin-only statistics and user management
