const Storage = require("../Model/storage.model");
const ApiError = require("../utils/ApiError");

const storageSummary = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id || !user.email) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    const storage = await Storage.findOne({
      userId: user.id,
    });
    if (!storage) {
      return res.status(400).json(new ApiError(400, "Storage not found"));
    }

    return res.status(200).json(
      new ApiError(200, "Storage Summary", {
        success: true,
        usedStorage: storage.usedStorage,
        totalStorage: storage.totalStorage,
        folder: storage.folderItem,
        images: storage.imageItem,
        videos: storage.videoItem,
        pdfs: storage.pdfItem,
        text: storage.textItem,
        imageStorage: storage.imageStorage,
        videoStorage: storage.videoStorage,
        pdfStorage: storage.pdfStorage,
        textStorage: storage.textStorage,
        isPremium: storage.isPremium,
      })
    );
  } catch (error) {
    console.log("error from storageSummary", error);
    res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

module.exports = {
  storageSummary,
};
