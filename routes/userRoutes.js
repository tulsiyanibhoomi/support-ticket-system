const express = require("express");
const router = express.Router();

const { getUsers, createUser } = require("../controllers/userController");

const {protect} = require("../middlewares/authMiddleware");
const {authorizeRoles} = require("../middlewares/roleMiddleware");

router.use(protect);

router.get("/", authorizeRoles("MANAGER"), getUsers);
router.post("/", authorizeRoles("MANAGER"), createUser);

module.exports = router;
