const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../Model/user.model");
const Storage = require("../Model/storage.model");
const { File } = require("../Model/file.model");
const ApiError = require("../utils/ApiError");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1️⃣ Find user by Google ID or email
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });
        }

        // 2️⃣ If not found, create one (auto‑verify email)
        if (!user) {
          user = await User.create({
            username: profile.displayName
              ? profile.displayName
              : profile.emails[0].value,
            email: profile.emails[0].value,
            googleId: profile.id,
            isVerified: true,
            termsAndConditions: true, // optionally show T&C on first login
          });

          // 💾 ALSO: create storage + root folder like your signup flow
          const createStorageForUser = await Storage.create({
            userId: user._id,
            totalStorage: 16113868800, // 15GB in bytes = 15 * 1024 * 1024 * 1024
          });
          const createRootFolder = await File.create({
            ownerId: user._id,
            name: "root",
            size: 0,
            isRootFolder: true,
            type: "folder",
            mimeType: "folder",
          });
          if (!createStorageForUser || !createRootFolder) {
            return res
              .status(500)
              .json(new ApiError(500, "Internal Server Error"));
          }

          user.rootFolderId = createRootFolder._id;
          user.storageId = createStorageForUser._id;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id)
    .then((user) => done(null, user))
    .catch(done)
);

module.exports = passport;
