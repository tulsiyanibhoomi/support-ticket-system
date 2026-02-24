const express = require("express");
const router = express.Router();
const {loginUser} = require("../controllers/authController");

const {protect} = require("../middlewares/authMiddleware");

router.post("/login", loginUser);

module.exports = router;