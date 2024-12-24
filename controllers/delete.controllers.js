import pool from '../database.js'

export const delUser = async (req, res) => {
  const { id } = req.params
  try {
    const sql = 'UPDATE accounts SET status = 0 WHERE id = ?'
    const [result] = await pool.query(sql, [id])
    res.status(200).send(result)
  } catch (error) {
    res.status(500).send(error)
  }
}