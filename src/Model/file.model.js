const mongoose = require("mongoose");
const { Schema } = mongoose;

const fileSchema = new Schema(
  {
    ownerId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["file", "folder"],
    },
    fileName: {
      type: String,
      required: true,
    },
    parentId: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
module.exports = {
  File: mongoose.model("File", fileSchema),
};
