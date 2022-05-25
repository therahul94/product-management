const express = require('express')
const router = express.Router()
const {createUser, login, getUserDetails} = require('../controllers/userController')
const {authentication} = require('../middleware/auth')

router.post('/register', createUser)
router.post('/login', login)
router.get('/user/:userId/profile', authentication, getUserDetails)

module.exports = router