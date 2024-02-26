// app.js
const express = require("express");
const app = express();

// Define a simple route
app.get("/", (req, res) => {
  res.send("Hello, this is your server responding!");
});

module.exports = app;
