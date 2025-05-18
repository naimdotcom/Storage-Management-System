// /utils/deleteUserFiles.js
const bucket = require("../config/firebase");

/**
 * Delete everything under a prefix.  1000 objects at a time (Firebase limit).
 */
async function deleteAllUserFiles(userId) {
  const prefix = `userFiles/${userId}/`;
  const [files] = await bucket.getFiles({ prefix });

  if (files.length === 0) return;

  // Batch delete promises
  await Promise.all(
    files.map(async (file) => {
      await file.delete();
    })
  );
}

module.exports = deleteAllUserFiles;
