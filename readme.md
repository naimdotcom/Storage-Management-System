# Storage Management System

A full‑stack cloud‑storage backend built with **Node.js, Express 5, MongoDB, Firebase Cloud Storage, and JWT**.  
It lets users sign up, upload files or create folders, track quota, and manage favorites—similar to Google Drive’s core workflow, but fully open‑source.

<!-- ![Architecture Diagram](docs/architecture.png)  optional visual -->

---

## ✨ Key Features

| Area                  | Highlights                                                       | Real‑life benefit                                 |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| **Authentication**    | Email/OTP signup, JWT sessions, bcrypt‑hashed passwords          | Secure access without third‑party auth vendors    |
| **User Storage**      | 15 GB free quota, real‑time usage counters                       | Prevents surprises—users always see space left    |
| **File Uploads**      | Multer → Firebase bucket streaming; signed URLs valid to 2491 🤯 | Cheap CDN‑style delivery without own object store |
| **Folder Tree**       | Any‑depth parent/child relationship in Mongo                     | Mirrors familiar desktop file explorers           |
| **Typed Metrics**     | Per‑MIME counts (image/video/pdf/txt/other)                      | Quick dashboards; e.g., “clean up big videos”     |
| **Favorites & Trash** | Toggle / soft‑delete with timestamps                             | Undo accidents and build “starred” view           |
| **RESTful API v1**    | `/api/v1/auth • /storage • /directory`                           | Easy front‑end or mobile integration              |
| **Email Service**     | Nodemailer + Gmail App Password                                  | Production‑ready verification flow                |

---

## 🗺️ Project Structure

    ├── index.js # entry point, boots Express
    ├── src/
    │ ├── app.js # Express middlewares & versioned routes
    │ ├── controller/ # Auth, File, Storage logic
    │ ├── Model/ # Mongoose schemas
    │ ├── middleware/ # JWT guard, Multer config
    │ ├── lib/ # Hashing, JWT utils, Mailer
    │ ├── Routes/ # v1 route groups
    │ └── utils/ # Reusable helpers & templates
    └── public/temp/ # temp uploads before Firebase push

---

## 🚀 Getting Started

### 1 . Clone & Install

```bash
git clone https://github.com/naimdotcom/storage-management-system.git
cd storage-management-system
npm install
```

2 . Environment Variables

Create .env in the root:

```.env
PORT=4000
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/sms
JWT_SECRET=superSecretJWT
SALT=10
# Gmail
HOST_MAIL=youremail@gmail.com
APP_PASSWORD=xxxx xxxx xxxx xxxx
# Firebase
STORAGE_BUCKET=your-bucket.appspot.com

```

Tip: The Firebase service‑account JSON referenced in src/config/firebase.js should live next to that file and be git‑ignored.

3 . Run Locally

```bash
npm run dev   # nodemon

# or
npm start

Server listens on http://localhost:4000.
```

---

🛠️ API Reference (excerpt)

| Method | Endpoint                                     | Purpose                        |
| ------ | -------------------------------------------- | ------------------------------ |
| POST   | /api/v1/auth/signup                          | Create user & root folder      |
| POST   | /api/v1/auth/login                           | JWT + cookie login             |
| POST   | /api/v1/auth/verify-otp                      | Finalize email verification    |
| GET    | /api/v1/storage/summary                      | Storage quota & type breakdown |
| POST   | /api/v1/directory/folder/:id                 | Create sub‑folder inside id    |
| POST   | /api/v1/directory/upload/:id                 | Upload file into folder id     |
| GET    | /api/v1/directory/:id                        | Details of file/folder         |
| PATCH  | /api/v1/directory/favorite/:id?favorite=true | Toggle star                    |
| DELETE | /api/v1/directory/:id                        | Soft‑delete file/folder        |

Full route list lives in src/Routes.

---

🧪 Testing ideas
• Postman collection can be found under docs/.
• Spin up Mongo Memory Server for fast unit tests of controllers.

---

📝 License

This project is licensed under the MIT License—see LICENSE file for details.
