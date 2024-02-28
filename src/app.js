const express = require("express");
const bodyParser = require("body-parser");
const dbConfig = require("../config/db");
const mysql = require("mysql2");
// const authRoutes = require("./src/routes/authRoutes");

// Create an Express app
const app = express();

// Use body-parser middleware
app.use(bodyParser.json());   

// Database connection setup
const connection = mysql.createConnection({
  host: dbConfig.mysql.host,
  user: dbConfig.mysql.user,
  password: dbConfig.mysql.password,
  database: dbConfig.mysql.database,
  port: dbConfig.mysql.port,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");
});

// Store the database connection for later use if needed
app.set("db", connection);

// Define routes
// app.use("/auth", authRoutes);

// ... (add more routes as your application grows)

module.exports = app;
