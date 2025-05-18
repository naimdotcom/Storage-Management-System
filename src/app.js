const express = require("express");
const app = express();
const cors = require("cors");
const routes_v1 = require("./Routes/index"); // version 1 routes
const session = require("express-session");
const passport = require("./config/passport");

app.use(
  cors({
    origin: "*",
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", routes_v1);

module.exports = { app };
