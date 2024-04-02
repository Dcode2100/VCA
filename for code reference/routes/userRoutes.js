const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all users
router.get('/users', userController.getAllUsers);

// POST create a new user
router.post('/users', userController.createUser);

module.exports = router;
