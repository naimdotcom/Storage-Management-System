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
      type: Schema.Types.ObjectId || null,
      ref: "File",
      index: true,
      default: null,
      required: function () {
        return !this.isRoot;
      },
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      default: 0,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isRoot: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileSchema);

module.exports = { File };
