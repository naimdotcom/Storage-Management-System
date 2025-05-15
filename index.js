const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const { connectDB } = require("./src/DB");
const { app } = require("./src/app");

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log("Server is running on port", process.env.PORT || 4000);
    });
  })
  .catch((err) => {
    console.log("error from DB", err);
  });
