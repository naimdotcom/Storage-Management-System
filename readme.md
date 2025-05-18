# Storage Management System

A production‑ready **Node.js + Express 5** backend that delivers secure, quota‑aware cloud storage — think "self‑hosted Google Drive core" — powered by **MongoDB, Firebase Cloud Storage, and JWT sessions**.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Getting firebase‑adminsdk.json](#getting-firebase-adminsdkjson)
8. [API Reference](#api-reference)
9. [Contributing](#contributing)
10. [License](#license)

---

## Architecture Overview

```
Client ─▶ REST API (Express) ─▶ Controllers ─▶ Services/Utils ─▶ MongoDB
                       │
                       └─▶ Firebase Cloud Storage (files)
```

- **Stateless JWT auth** guards every route.
- **Mongoose ODM** models persist users, folders, files, and storage quotas.
- **Firebase** stores the raw file objects; signed URLs (2491 expiry) enable CDN‑level delivery.
- **Multer** streams uploads directly to a temp directory before off‑loading to Firebase.

---

## Features

| Category                   | Description                                                                      |
| -------------------------- | -------------------------------------------------------------------------------- |
| **Authentication**         | Email+OTP sign‑up, BCrypt passwords, Google OAuth 2.0, refresh‑less JWT sessions |
| **Granular Storage Quota** | 15 GB free tier with per‑MIME counters (image/video/pdf/txt/other)               |
| **Full File Tree**         | Unlimited depth, root folder created at user onboarding                          |
| **Favorites & Trash**      | Soft‑delete with timestamps, one‑click starring                                  |
| **Typed Metrics**          | `/storage/summary` returns storage + item counts, enabling dashboards            |
| **Extensible REST API**    | Versioned under `/api/v1/*`, ready for mobile or SPA clients                     |
| **Email Service**          | Nodemailer + Gmail App Password for OTP and password‑reset flows                 |

---

## Tech Stack

- **Runtime:** Node.js 20 LTS
- **Framework:** Express 5.x
- **Database:** MongoDB (Mongoose 8.x)
- **Object Storage:** Firebase Cloud Storage
- **Auth & Security:** JSON Web Tokens, bcrypt, Passport Google OAuth
- **Utilities:** Multer, UUID, Dotenv, Nodemailer

---

## Folder Structure

```
root
├── index.js              # boots server & DB
├── src/
│   ├── app.js           # Express app instance & middlewares
│   ├── controller/      # Business logic
│   ├── Model/           # Mongoose schemas
│   ├── middleware/      # Auth guards, upload pipe
│   ├── lib/             # JWT, bcrypt, mailer helpers
│   ├── Routes/          # Versioned route groups
│   ├── config/          # Firebase & Passport setup
│   └── utils/           # Reusable helpers & error classes
└── docs/ (optional)     # API collections / diagrams
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas URI or local instance
- Firebase project with a Storage bucket

### Installation

```bash
git clone https://github.com/naimdotcom/storage-management-system.git
cd storage-management-system
npm install
```

### Run Locally

```bash
# development (nodemon)
npm run dev

# production
npm start
```

Default server: `http://localhost:4000` (change via `PORT` env).

---

## Environment Variables

Create a `.env` file at project root:

```
PORT=4000
# Mongo
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/sms
# Auth
JWT_SECRET=superSecretJWT
SESSION_SECRET=sessionSecret
SALT=10
# Gmail for Nodemailer
HOST_MAIL=youremail@gmail.com
APP_PASSWORD=xxxx xxxx xxxx xxxx
# Firebase
STORAGE_BUCKET=your-bucket.appspot.com
GOOGLE_CLIENT_ID=<oauth-id>
GOOGLE_CLIENT_SECRET=<oauth-secret>
```

---

## Getting firebase‑adminsdk.json

Firebase uses a service‑account key to let your backend upload / sign files without user interaction.
Follow these steps to generate it:

1. Open Firebase Console → Project Settings (⚙️ icon beside “Project Overview”).
2. Select “Service accounts” tab.
3. Click “Generate new private key” → Generate key → a JSON file downloads.
4. Rename the file (optional) to match the import in src/config/firebase.js

mv path/to/downloaded-key.json \
src/config/firebase-adminsdk.json

5. Keep it out of git – it’s already in .gitignore.
6. Make sure STORAGE_BUCKET=<your‑bucket>.appspot.com is present in .env.

---

## API Reference (excerpt)

| Method                                        | Endpoint                                       | Description                   |
| --------------------------------------------- | ---------------------------------------------- | ----------------------------- |
| POST                                          | `/api/v1/auth/signup`                          | Register + create root folder |
| POST                                          | `/api/v1/auth/login`                           | Obtain JWT cookie/token       |
| POST                                          | `/api/v1/auth/verify-otp`                      | Finalize email verification   |
| GET                                           | `/api/v1/storage/summary`                      | User quota & MIME breakdown   |
| POST                                          | `/api/v1/directory/folder/:id`                 | Create sub‑folder             |
| POST                                          | `/api/v1/directory/upload/:id`                 | Upload file into folder       |
| PATCH                                         | `/api/v1/directory/favorite/:id?favorite=true` | Toggle star                   |
| DELETE                                        | `/api/v1/directory/:id`                        | Soft‑delete file/folder       |
| Full route definitions live in `src/Routes/`. |                                                |                               |

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.
