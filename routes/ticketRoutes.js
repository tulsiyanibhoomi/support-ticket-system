const express = require("express");
const router = express.Router();

const { createTicket, getTickets, assignTicket, updateTicketStatus } = require("../controllers/ticketController");
const { addComment, getComments, updateComment } = require("../controllers/commentController");

const {protect} = require("../middlewares/authMiddleware");
const {authorizeRoles} = require("../middlewares/roleMiddleware");

router.use(protect);

router.post("/", authorizeRoles("USER", "MANAGER"), createTicket);
router.get("/", getTickets);
router.patch("/:id/assign", authorizeRoles("MANAGER", "SUPPORT"), assignTicket);
router.patch("/:id/status", authorizeRoles("MANAGER", "SUPPORT"), updateTicketStatus);

router.post("/:id/comments", addComment);
router.get("/:id/comments", getComments);
router.patch("/comments/:id", authorizeRoles("MANAGER"), updateComment);

module.exports = router;
