const Comment = require("../models/Comment");
const pool = require("../config/db");
const ApiError = require("../utils/apiError");

exports.addComment = async (req, res, next) => {
    try{
        const ticketId = req.params.id;
        const{comment} = req.body;
        const userId = req.user.id;

        const [ticketRow] = await pool.query("select * from tickets where id =?",[ticketId]);
        if(ticketRow.length==0){
            throw new ApiError(404, "No ticket found");
        }

        const ticket = ticketRow[0];
        const roleName = req.user.role.name;
        if((roleName==="USER" && ticket.created_by != userId) || (roleName==="SUPPORT" && ticket.assigned_to !== userId)){
            throw new ApiError(403, "Not allowed");
        }
        const newComment = await Comment.addComment(ticketId, userId, comment);
        return res.status(201).json(newComment);
    }catch(err){
        next(err);
    }
}

exports.getComments = async(req, res, next) => {
    try{
        const ticketId = req.params.id;
        const userId = req.user.id;

        const [ticketRow] = await pool.query("select * from tickets where id =?",[ticketId]);
        if(ticketRow.length==0){
            throw new ApiError(404, "No ticket found");
        }

        const ticket = ticketRow[0];
        const roleName = req.user.role.name;
        if((roleName==="USER" && ticket.created_by != userId) || (roleName==="SUPPORT" && ticket.assigned_to !== userId)){
            throw new ApiError(403, "Not allowed");
        }

        const comments = await Comment.getCommentsByTicket(ticketId);
        return res.status(200).json(comments);
    }
    catch(err) {
        next(err);
    }
}

exports.updateComment = async (req,res,next)=> {
    try{
        const commentId = req.params.id;
        const userId = req.user.id;
        const {comment} = req.body;

        if(!comment) {
            throw new ApiError(400, "Comment is required");
        }
        const updatedComment = await Comment.updateComment(commentId, userId, comment);
        return res.status(200).json(updatedComment);
    }
    catch(err){
        next(err);
    }
}

exports.deleteComment=async(req,res,next)=> {
    try{
        const commentId = req.params.id;
        const userId = req.user.id;

        await Comment.deleteComment(commentId, userId);
        return res.status(204).send();
    }
    catch(err) {
        next(err);
    }
}