const pool = require("../config/db");
const ApiError = require("../utils/apiError");

const valid_priority = ["LOW", "MEDIUM", "HIGH"];
const valid_status = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const Ticket = {
    create: async({title, description, priority, created_by}) => {

        if(!title || title.length<5){
            throw new ApiError(400, "Title must be at least 5 characters");
        }
        if(!description || description.length<10){
            throw new ApiError(400, "Description must be at least 10 characters");
        }
        if(!valid_priority.includes(priority)){
            throw new ApiError(400, "Invalid Priority Value");
        }

        const [result] = await pool.query(`
            insert into tickets (title, description, priority, created_by) values (?,?,?,?)
        `, [title, description, priority, created_by]);

        const ticketId = result.insertId;

        const [rows] = await pool.query(`
            select t.id, t.title, t.description, t.status, t.priority, t.created_at, cu.id as created_id, cu.name as created_name, cu.email as created_email, cr.id as created_role_id, cr.name as created_role_name, cu.created_at as created_user_created_at, au.id as assigned_id, au.name as assigned_name, au.email as assigned_email, ar.id as assigned_role_id, ar.name as assigned_role_name, au.created_at as assigned_user_created_at 
            from tickets t
            join users cu on t.created_by = cu.id
            join roles cr on cu.role_id = cr.id
            left join users au on t.assigned_to = au.id
            left join roles ar on au.role_id = ar.id
            where t.id = ?
        `, [ticketId]);

        const row = rows[0];

        return {
            id: row.id,
            title: row.title,
            description: row.description,
            status: row.status,
            priority: row.priority,
            created_by: {
                id: row.created_id,
                name: row.created_name,
                email: row.created_email,
                role: {
                    id: row.created_role_id,
                    name: row.created_role_name
                },
                created_at: row.created_user_created_at
            },
            assigned_to: {
                id: row.assigned_id,
                name: row.assigned_name,
                email: row.assigned_email,
                role: {
                    id: row.assigned_role_id,
                    name: row.assigned_role_name
                },
                created_at: row.assigned_user_created_at
            },
            created_at: row.created_at
        };
    },

    get: async (user) => {
        let query = `
            select t.id, t.title, t.description, t.status, t.priority, t.created_at, cu.id as created_id, cu.name as created_name, cu.email as created_email, cr.id as created_role_id, cr.name as created_role_name, cu.created_at as created_user_created_at, au.id as assigned_id, au.name as assigned_name, au.email as assigned_email, ar.id as assigned_role_id, ar.name as assigned_role_name, au.created_at as assigned_user_created_at 
            from tickets t
            join users cu on t.created_by = cu.id
            join roles cr on cu.role_id = cr.id
            left join users au on t.assigned_to = au.id
            left join roles ar on au.role_id = ar.id
        `;
        const params = [];

        if(user.role.name === "USER") {
            query += " WHERE t.created_by = ?";
            params.push(user.id);
        }
        else if(user.role.name === "SUPPORT") {
            query += " WHERE t.assigned_to = ?";
            params.push(user.id);
        }

        const [rows] = await pool.query(query, params);

        return rows.map(row=> ({
            id: row.id,
            title: row.title,
            description: row.description,
            status: row.status,
            priority: row.priority,
            created_by: {
                id: row.created_id,
                name: row.created_name,
                email: row.created_email,
                role: {
                    id: row.created_role_id,
                    name: row.created_role_name
                },
                created_at: row.created_user_created_at
            },
            assigned_to: {
                id: row.assigned_id,
                name: row.assigned_name,
                email: row.assigned_email,
                role: {
                    id: row.assigned_role_id,
                    name: row.assigned_role_name
                },
                created_at: row.assigned_user_created_at
            },
            created_at: row.created_at
        }));
    },

    assign: async(ticketId, userId) => {
        const [ticketRows] = await pool.query("Select * from tickets where id = ?", [ticketId]);
        if(ticketRows.length==0){
            throw new ApiError(404, "Ticket not found");
        }

        const [userRows] = await pool.query(`
            select u.id, u.name, u.email, r.id, r.name as rolename, u.created_at
            from users u
            join roles r on u.role_id = r.id
            where u.id=?
        `, [userId]);
        if(userRows.length==0){
            throw new ApiError(404, "User not found");
        }

        const user = userRows[0];
        if(user.rolename !== "SUPPORT") {
            throw new ApiError(400,"Tickets can be assigned to SUPPORT users");
        }

        await pool.query("UPDATE tickets set assigned_to=? where id = ?", [userId, ticketId]);

        const [rows] = await pool.query(`select t.id, t.title, t.description, t.status, t.priority, t.created_at, cu.id as created_id, cu.name as created_name, cu.email as created_email, cr.id as created_role_id, cr.name as created_role_name, cu.created_at as created_user_created_at, au.id as assigned_id, au.name as assigned_name, au.email as assigned_email, ar.id as assigned_role_id, ar.name as assigned_role_name, au.created_at as assigned_user_created_at 
            from tickets t
            join users cu on t.created_by = cu.id
            join roles cr on cu.role_id = cr.id
            left join users au on t.assigned_to = au.id
            left join roles ar on au.role_id = ar.id
            where t.id = ?
            `, [ticketId]);

        const row = rows[0];
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            status: row.status,
            priority: row.priority,
            created_by: {
                id: row.created_id,
                name: row.created_name,
                email: row.created_email,
                role: {
                    id: row.created_role_id,
                    name: row.created_role_name
                },
                created_at: row.created_user_created_at
            },
            assigned_to: {
                id: row.assigned_id,
                name: row.assigned_name,
                email: row.assigned_email,
                role: {
                    id: row.assigned_role_id,
                    name: row.assigned_role_name
                },
                created_at: row.assigned_user_created_at
            },
            created_at: row.created_at
        };
    },

    updateStatus: async(ticketId, newStatus, changedBy) => {
        const [ticketRows] = await pool.query("Select * from tickets where id = ?", [ticketId]);
        if(ticketRows.length==0){
            throw new ApiError(404, "Ticket not found");
        }

        const ticket = ticketRows[0];
        const currentStatus = ticket.status;

        if(!valid_status.includes(newStatus)){
            throw new ApiError(400, "Invalid status value");
        }

        const allowedTransitions = {
            "OPEN": ["IN_PROGRESS"],
            "IN_PROGRESS": ["RESOLVED"],
            "RESOLVED": ["CLOSED"],
            "CLOSED": []
        }

        if(!allowedTransitions[currentStatus].includes(newStatus)){
            throw new ApiError(400, "Invalid Status transition");
        }

        await pool.query(`update tickets set status = ? where id = ?`, [newStatus, ticketId]);

        await pool.query(`
            insert into ticket_status_logs(ticket_id, old_status, new_status, changed_by) values (?,?,?,?)
        `, [ticketId, currentStatus, newStatus, changedBy]);

        const [rows] = await pool.query(`
                select t.id, t.title, t.description, t.status, t.priority, t.created_at, cu.id as created_id, cu.name as created_name, cu.email as created_email, cr.id as created_role_id, cr.name as created_role_name, cu.created_at as created_user_created_at, au.id as assigned_id, au.name as assigned_name, au.email as assigned_email, ar.id as assigned_role_id, ar.name as assigned_role_name, au.created_at as assigned_user_created_at 
            from tickets t
            join users cu on t.created_by = cu.id
            join roles cr on cu.role_id = cr.id
            left join users au on t.assigned_to = au.id
            left join roles ar on au.role_id = ar.id
            where t.id = ?
        `, [ticketId]);

        const row =rows[0];

        return {id: row.id,
            title: row.title,
            description: row.description,
            status: row.status,
            priority: row.priority,
            created_by: {
                id: row.created_id,
                name: row.created_name,
                email: row.created_email,
                role: {
                    id: row.created_role_id,
                    name: row.created_role_name
                },
                created_at: row.created_user_created_at
            },
            assigned_to: {
                id: row.assigned_id,
                name: row.assigned_name,
                email: row.assigned_email,
                role: {
                    id: row.assigned_role_id,
                    name: row.assigned_role_name
                },
                created_at: row.assigned_user_created_at
            },
            created_at: row.created_at};
    },
    deleteTicket: async (ticketId) => {
        const [ticketRows] = await pool.query(`select * from tickets where id = ?`, [ticketId]);
        if(ticketRows.length==0){
            throw new ApiError(404, "ticket not found");
        }
        await pool.query("delete from tickets where id = ?", [ticketId]);
        return;
    }
}

module.exports = Ticket;