const mongoose = require("mongoose");
const { Schema } = mongoose;

const fileSchema = new Schema(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,
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
      type: Schema.Types.ObjectId,
      required: true,
      ref: "File",
      index: true,
      default: null,
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

const File = mongoose.model("File", fileSchema);

module.exports = { File };
