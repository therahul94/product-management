const express = require("express");
const router = express.Router();
const mid=require("../middleware/auth")
const { createUser, login ,getUserDetails,updatedUserProfile} = require("../controllers/userController");

router.post("/register", createUser);
router.post("/login", login);
router.get("/user/:userId/profile",mid.authentication,mid.authorization,getUserDetails)
router.put("/user/:userId/profile",mid.authentication,mid.authorization,updatedUserProfile)

module.exports = router;
