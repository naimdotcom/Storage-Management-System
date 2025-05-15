const express = require("express");
const app = express();
const cors = require("cors");
const routes_v1 = require("./Routes/index"); // version 1 routes

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", routes_v1);

module.exports = { app };
