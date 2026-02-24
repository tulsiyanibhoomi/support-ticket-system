const pool = require("../config/db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = {
  find: async () => {
    const [rows] = await pool.query(
      `select 
        u.id as userid,
        u.name as username,
        u.email,
        r.id as roleid,
        r.name as rolename,
        u.created_at
        from users u
        join roles r
        on u.role_id = r.id`,
    );

    const result = rows.map((row) => ({
      id: row.userid,
      name: row.username,
      email: row.email,
      role: {
        id: row.roleid,
        name: row.rolename,
      },
      created_at: row.created_at,
    }));

    return result;
  },

  create: async ({ name, email, password, role }) => {
    const [roleID] = await pool.query("select id from roles where name = ?", [
      role,
    ]);

    if (roleID.length == 0) {
      throw new Error("Invalid Role");
    }

    const role_id = roleID[0].id;
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_VALUE),
    );

    const createdAt = new Date();

    const [result] = await pool.query(
      "insert into users (name, email, password, role_id, created_at) values (?,?,?,?,?)",
      [name, email, hashedPassword, role_id, createdAt],
    );

    return {
      id: result.insertId,
      name,
      email,
      role: {
        id: role_id,
        name: role,
      },
      created_at: createdAt,
    };
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      `select 
        u.id as userid,
        u.name as username,
        u.email,
        u.password,
        r.id as roleid,
        r.name as rolename,
        u.created_at
        from users u
        join roles r
        on u.role_id = r.id
        where u.id=?
        `, [id],
    );

    const row=rows[0];

    const result = {
      id: row.userid,
      name: row.username,
      email: row.email,
      password: row.password,
      role: {
        id: row.roleid,
        name: row.rolename,
      },
      created_at: row.created_at,
    };

    return result;
  },

  findOne: async ({email}) => {
    const [rows] = await pool.query(
      `select 
        u.id as userid,
        u.name as username,
        u.email,
        u.password,
        r.id as roleid,
        r.name as rolename,
        u.created_at
        from users u
        join roles r
        on u.role_id = r.id
        where u.email = ?
        `,[email],
    );

    const row=rows[0];

    const result = {
      id: row.userid,
      name: row.username,
      email: row.email,
      password: row.password,
      role: {
        id: row.roleid,
        name: row.rolename,
      },
      created_at: row.created_at,
    };
    return result;
  },
};

module.exports = User;
