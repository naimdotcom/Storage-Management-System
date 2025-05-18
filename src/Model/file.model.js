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
      index: true,
    },
    name: {
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
      index: true,
    },
    size: {
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
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isRootFolder: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileSchema);

module.exports = { File };
