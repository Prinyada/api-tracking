import pool from '../database.js'

export const getProfileController = async (req, res) => {
  const { userid } = res.locals.user
  const [user] = await pool.query('SELECT * FROM accounts as user , role as role where user.level = role.role_id AND status = 1 AND user.id = ?', [userid])
  return res.send(user[0])
}
