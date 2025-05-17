const admin = require("firebase-admin");

const serviceAccount = require("./fir-blog-7b79b-firebase-adminsdk-f4omq-dfdf4035ab.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
