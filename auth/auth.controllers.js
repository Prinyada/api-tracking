import md5 from 'md5'
import pool from '../database.js'
import { generateToken } from './auth.services.js'

export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body
    const decryptedPassword = md5(password)
    const results = await pool.query('SELECT * FROM accounts as user, role as role WHERE user.level = role.role_id AND status = 1 AND user.username = ? AND user.password = ? ', [username, decryptedPassword])
    const [users] = results
    const user = users[0]
    if (user) {
      const userJSON = { userid: user.id, prefix: user.prefix, name: `${user.firstName} ${user.lastName}` }
      const accesstoken = generateToken(userJSON)
      res.send({ user, accesstoken })
    } else {
      res.status(401).send({ message: 'User not found' })
    }
  } catch (e) {
    res.status(500).send(e)
  }
}
