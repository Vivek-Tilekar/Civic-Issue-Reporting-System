const express = require('express');
const { signup, signin, adminSignin } = require('../controllers/auth_controller.js');

const router = express.Router()

// SignUp the User
router.post("/signup" , signup)

// SignIn the User
router.post('/signin' , signin)

// SignIn the Admin
router.post('/adminsignin' , adminSignin)

module.exports = router;