const mongoose = require("mongoose");
const { Schema } = mongoose;

const storageSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    totalStorage: {
      type: Number,
      required: true,
    },
    usedStorage: {
      type: Number,
      default: 0,
    },
    screteFolderPassword: {
      type: String,
      default: null,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    folderItem: {
      type: Number,
      default: 0,
    },
    folderStorage: {
      type: Number,
      default: 0,
    },
    imageItem: {
      type: Number,
      default: 0,
    },
    imageStorage: {
      type: Number,
      default: 0,
    },
    videoItem: {
      type: Number,
      default: 0,
    },
    videoStorage: {
      type: Number,
      default: 0,
    },
    pdfItem: {
      type: Number,
      default: 0,
    },
    pdfStorage: {
      type: Number,
      default: 0,
    },
    txtItem: {
      type: Number,
      default: 0,
    },
    txtStorage: {
      type: Number,
      default: 0,
    },
    otherItem: {
      type: Number,
      default: 0,
    },
    otherStorage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Storage =
  mongoose.models.Storage || mongoose.model("Storage", storageSchema);
module.exports = Storage;
