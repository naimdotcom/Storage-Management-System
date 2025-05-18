const fs = require("fs");
const { bucket } = require("../config/firebase");
const { File } = require("../Model/file.model");
const Storage = require("../Model/storage.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const removeTmp = (path) => fs.existsSync(path) && fs.unlinkSync(path);

const getFolderOr404 = async (id) => {
  const folder = await File.findById(id);
  if (!folder) throw new ApiError(404, "Folder not found");
  if (folder.isDeleted) throw new ApiError(403, "Folder deleted");
  if (folder.type !== "folder") throw new ApiError(400, "Not a folder");
  return folder;
};

const buildIncFields = (mime, size) => {
  const group = mime.startsWith("image/")
    ? "image"
    : mime.startsWith("video/")
    ? "video"
    : mime === "application/pdf"
    ? "pdf"
    : mime === "text/plain"
    ? "txt"
    : "other";
  return {
    usedStorage: size,
    [`${group}Item`]: 1,
    [`${group}Storage`]: size,
  };
};

/* ───────────────────────── controllers ───────────────────── */

exports.uploadFile = async (req, res) => {
  try {
    const { file } = req;
    const { id: parentId } = req.params;
    const { user } = req;

    if (!file || !parentId)
      return res
        .status(400)
        .json(new ApiError(400, "File and parentId are required"));

    await getFolderOr404(parentId);

    const destination = `user_files/${user.id || "unknown"}/${file.filename}`;
    await bucket.upload(file.path, {
      destination,
      metadata: { contentType: file.mimetype },
    });

    const [signedUrl] = await bucket
      .file(destination)
      .getSignedUrl({ action: "read", expires: "03-09-2491" });

    const created = await File.create({
      ownerId: user.id,
      type: "file",
      name: file.originalname,
      parentId,
      mimeType: file.mimetype,
      size: file.size,
      fileUrl: signedUrl,
    });

    await Storage.findOneAndUpdate(
      { userId: user._id },
      { $inc: buildIncFields(file.mimetype, file.size) }
    );

    removeTmp(file.path);

    return res
      .status(201)
      .json(
        new ApiResponse(201, "File uploaded", { success: true, item: created })
      );
  } catch (err) {
    removeTmp(req.file?.path);
    const { statusCode = 500, message = "Internal Server Error" } = err;
    return res.status(statusCode).json(new ApiError(statusCode, message));
  }
};

exports.createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const { id: parentId } = req.params;
    const { user } = req;

    if (!parentId)
      return res.status(400).json(new ApiError(400, "parentId is required"));

    await getFolderOr404(parentId);

    const folder = await File.create({
      ownerId: user.id,
      name: name || "New Folder",
      type: "folder",
      parentId,
      mimeType: "folder",
      size: 0,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, "Folder created", { success: true, item: folder })
      );
  } catch (err) {
    const { statusCode = 500, message = "Internal Server Error" } = err;
    res.status(statusCode).json(new ApiError(statusCode, message));
  }
};

exports.getFolderFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    await getFolderOr404(id);

    const files = await File.find({
      ownerId: user.id,
      parentId: id,
      isDeleted: false,
    }).select("-__v");

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Files found", { success: true, items: files })
      );
  } catch (err) {
    const { statusCode = 500, message = "Internal Server Error" } = err;
    res.status(statusCode).json(new ApiError(statusCode, message));
  }
};

exports.getFileOrFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    if (!id) return res.status(400).json(new ApiError(400, "fileId required"));

    const item = await File.findOne({
      ownerId: user.id,
      _id: id,
      isDeleted: false,
    });

    if (!item) throw new ApiError(404, "Item not found");

    return res
      .status(200)
      .json(new ApiResponse(200, "Item found", { success: true, item }));
  } catch (err) {
    const { statusCode = 500, message = "Internal Server Error" } = err;
    res.status(statusCode).json(new ApiError(statusCode, message));
  }
};

exports.deleteFileOrFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const item = await File.findOneAndUpdate(
      { ownerId: user.id, _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!item) throw new ApiError(404, "Item not found");

    return res.status(204).end(); // No Content
  } catch (err) {
    const { statusCode = 500, message = "Internal Server Error" } = err;
    res.status(statusCode).json(new ApiError(statusCode, message));
  }
};

exports.renameFileOrFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const { user } = req;

    if (!name) return res.status(400).json(new ApiError(400, "name required"));

    const item = await File.findOneAndUpdate(
      { ownerId: user.id, _id: id, isDeleted: false },
      { name },
      { new: true }
    );

    if (!item) throw new ApiError(404, "Item not found");

    return res
      .status(200)
      .json(new ApiResponse(200, "Item renamed", { success: true, item }));
  } catch (err) {
    const { statusCode = 500, message = "Internal Server Error" } = err;
    res.status(statusCode).json(new ApiError(statusCode, message));
  }
};

exports.getMimeTypeFiles = async (req, res) => {
  try {
    const { mime } = req.query;
    const { user } = req;

    const map = {
      image: /^image\//i,
      video: /^video\//i,
      pdf: /^application\/pdf$/i,
      txt: /^text\/plain$/i,
      note: /^text\/plain$/i,
    };
    const regex = map[mime?.toLowerCase()];
    if (!regex)
      return res.status(400).json(new ApiError(400, "Unsupported mime"));

    const files = await File.find({
      ownerId: user.id,
      type: "file",
      mimeType: { $regex: regex },
      isDeleted: false,
    }).select("-__v");

    if (!files.length) throw new ApiError(404, "No files found");

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Files found", { success: true, items: files })
      );
  } catch (err) {
    const { statusCode = 500, message = "Internal Server Error" } = err;
    res.status(statusCode).json(new ApiError(statusCode, message));
  }
};

exports.updateFavoriteFileOrFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { favorite } = req.query;
    const { user } = req;

    if (favorite !== "true" && favorite !== "false")
      return res
        .status(400)
        .json(new ApiError(400, "favorite must be true|false"));

    const item = await File.findOneAndUpdate(
      { ownerId: user.id, _id: id, isDeleted: false },
      { isFavorite: favorite === "true" },
      { new: true }
    );

    if (!item) throw new ApiError(404, "Item not found");

    return res
      .status(200)
      .json(new ApiResponse(200, "Favorite updated", { success: true, item }));
  } catch (err) {
    const { statusCode = 500, message = "Internal Server Error" } = err;
    res.status(statusCode).json(new ApiError(statusCode, message));
  }
};

exports.getFileOrFolderByDate = async (req, res) => {
  try {
    const { date } = req.params; // YYYY-MM-DD
    const { type, mime } = req.query;
    const { user } = req;

    const start = new Date(`${date}T00:00:00Z`);
    if (isNaN(start))
      return res.status(400).json(new ApiError(400, "Invalid date"));
    const end = new Date(`${date}T23:59:59Z`);

    const filter = {
      ownerId: user.id,
      createdAt: { $gte: start, $lte: end },
      isDeleted: false,
    };
    if (type) filter.type = type;
    if (mime === "image") filter.mimeType = { $regex: /^image\//i };
    if (mime === "video") filter.mimeType = { $regex: /^video\//i };
    if (mime === "pdf") filter.mimeType = "application/pdf";
    if (mime === "txt") filter.mimeType = "text/plain";

    const items = await File.find(filter).sort({ createdAt: 1 }).select("-__v");

    return res
      .status(200)
      .json(new ApiResponse(200, "Items found", { success: true, items }));
  } catch (err) {
    const { statusCode = 500, message = "Internal Server Error" } = err;
    res.status(statusCode).json(new ApiError(statusCode, message));
  }
};
