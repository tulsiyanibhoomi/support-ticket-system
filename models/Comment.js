const pool = require("../config/db");
const ApiError = require("../utils/apiError");

const Comment = {
    addComment: async(ticketId, userId, commentText) => {
        if(!commentText || commentText.trim().length==0){
            throw new ApiError(400, "Comment can't be empty");
        }
        const [ticketRow] = await pool.query("select * from tickets where id = ?", [ticketId]);
        if(ticketRow.length==0){
            throw new ApiError(404, "No ticket found");
        }
        const ticket = ticketRow[0];
        const [result] = await pool.query(`
            insert into ticket_comments (ticket_id, user_id, comment) values (?,?,?)
        ` ,[ticketId, userId, commentText]);
        const commentId = result.insertId;
        const [rows] = await pool.query(`
            select tc.id, tc.comment, tc.created_at, u.id as userid, u.name as username, u.email as useremail, r.id as roleid, r.name as rolename, u.created_at as user_created_at
            from ticket_comments tc
            join users u on tc.user_id = u.id
            join roles r on u.role_id = r.id
            where tc.id = ?
        `, [commentId]);

        const row=rows[0];
        return {
            id: row.id,
            comment: row.comment,
            user: {
                id: row.userid,
                name: row.username,
                email: row.useremail,
                role: {
                    id: row.roleid,
                    name: row.rolename
                },
                created_at: row.user_created_at
            },
            created_at: row.created_at
        };
    },

    getCommentsByTicket: async (ticketId) => {
        const [ticketRow] = await pool.query("select * from tickets where id = ?", [ticketId]);
        if(ticketRow.length==0){
            throw new ApiError(404, "No ticket found");
        }

        const [rows] = await pool.query(`
            select tc.id, tc.comment, tc.created_at, u.id as userid, u.name as username, u.email as useremail, r.id as roleid, r.name as rolename, u.created_at as user_created_at
            from ticket_comments tc
            join users u on tc.user_id = u.id
            join roles r on u.role_id = r.id
            where tc.ticket_id = ?
            order by tc.created_at asc
        `, [ticketId]);
        return rows.map((row)=> ({
            id: row.id,
            comment: row.comment,
            user: {
                id: row.userid,
                name: row.username,
                email: row.useremail,
                role: {
                    id: row.roleid,
                    name: row.rolename
                },
                created_at: row.user_created_at
            },
            created_at: row.created_at
        }));
    },

    updateComment: async(commentId, userId, newComment) => {
        if(!newComment || newComment.trim().length==0){
            throw new ApiError(400, "Comment can't be empty");
        }
        const [commentRow] = await pool.query(`select * from ticket_comments where id=?`,[commentId]);
        if(commentRow.length==0){
            throw new ApiError(404, "Comment not found");
        }
        const comment = commentRow[0];
        const [userRows] = await pool.query(`
            select r.name as rolename from users u
            join roles r on u.role_id=r.id
            where u.id=?
        `, [userId]);
        if(userRows.length==0){
            throw new ApiError(401, "User not found");
        }
        const userRole = userRows[0].rolename;
        if(comment.user_id !== userId && userRole !== "MANAGER") {
            throw new ApiError(403, "You cannot edit this comment");
        }
        await pool.query(`
            update ticket_comments set comment = ? where id = ?    
        `, [newComment, commentId]);

        const [rows] = await pool.query(`
            select tc.id, tc.comment, tc.created_at, u.id as userid, u.name as username, u.email as useremail, r.id as roleid, r.name as rolename, u.created_at as user_created_at
            from ticket_comments tc
            join users u on tc.user_id = u.id
            join roles r on u.role_id = r.id
            where tc.id = ?
        `, [commentId]);
        const row=rows[0];
        return {
            id: row.id,
            comment: row.comment,
            user: {
                id: row.userid,
                name: row.username,
                email: row.useremail,
                role: {
                    id: row.roleid,
                    name: row.rolename
                },
                created_at: row.user_created_at
            },
            created_at: row.created_at
        };
    },
    
    deleteComment: async (commentId, userId) => {
        const [commentRow] = await pool.query(`select * from ticket_comments where id=?`,[commentId]);
        if(commentRow.length==0){
            throw new ApiError(404, "Comment not found");
        }
        const comment=commentRow[0];
        const [userRows] = await pool.query(`
            select r.name as rolename from users u
            join roles r on u.role_id=r.id
            where u.id=?
        `, [userId]);
        if(userRows.length==0){
            throw new ApiError(401, "User not found");
        }
        const userRole = userRows[0].rolename;
        if(comment.user_id !== userId && userRole !== "MANAGER") {
            throw new ApiError(403, "You cannot delete this comment");
        }
        await pool.query(`delete from ticket_comments where id = ?`, [commentId]);
        return;
    }
}

module.exports = Comment;