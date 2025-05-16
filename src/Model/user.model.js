const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    profile: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rootFolderId: {
      type: Schema.Types.ObjectId,
      ref: "File",
    },
    storageId: {
      type: Schema.Types.ObjectId,
      ref: "Storage",
    },
    termsAndConditions: {
      type: Boolean,
      default: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
