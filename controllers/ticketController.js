const Ticket = require("../models/Ticket");
const ApiError = require("../utils/apiError");

exports.createTicket = async (req, res, next) => {
    try{
        const {title, description, priority} = req.body;

        const ticket = await Ticket.create({
            title, description, priority, created_by: req.user.id
        });

        return res.status(201).json(ticket);
    }
    catch(err){
        next(err);
    }
};

exports.getTickets = async (req, res, next) => {
    try{
        const tickets = await Ticket.get(req.user);
        return res.status(200).json(tickets);
    }
    catch(err){
        next(err);
    }
}

exports.assignTicket = async (req, res, next) => {
    try{
        const ticketId = req.params.id;
        const {userId} = req.body;
        if(!userId){
            throw new ApiError(403, "Not Authenticated");
        }
        const ticket = await Ticket.assign(ticketId, userId);
        return res.status(200).json(ticket);
    }
    catch(err){
        next(err);
    }
}

exports.updateTicketStatus = async (req,res,next)=>{
    try{
        const ticketId = req.params.id;
        const {status} = req.body;
        if(!status){
            throw new ApiError(400, "status is required");
        }
        const updatedTicket = await Ticket.updateStatus(ticketId, status, req.user.id);
        return res.status(200).json(updatedTicket);
    }catch(err){
        next(err);
    }
}