const express = require("express");
const router = express.Router();

const { createTicket, getTickets, assignTicket, updateTicketStatus, deleteTicket } = require("../controllers/ticketController");
const { addComment, getComments, updateComment, deleteComment } = require("../controllers/commentController");

const {protect} = require("../middlewares/authMiddleware");
const {authorizeRoles} = require("../middlewares/roleMiddleware");

router.use(protect);

router.post("/", authorizeRoles("USER", "MANAGER"), createTicket);
router.get("/", getTickets);
router.patch("/:id/assign", authorizeRoles("MANAGER", "SUPPORT"), assignTicket);
router.patch("/:id/status", authorizeRoles("MANAGER", "SUPPORT"), updateTicketStatus);
router.delete("/:id", authorizeRoles("MANAGER"), deleteTicket);

router.post("/:id/comments", addComment);
router.get("/:id/comments", getComments);
router.patch("/comments/:id", authorizeRoles("MANAGER"), updateComment);
router.delete("/comments/:id", authorizeRoles("MANAGER"), deleteComment);

module.exports = router;
