const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', userRoutes); // Prefix all user routes with '/api'

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;  // Export the app instance for testing or other purposes
