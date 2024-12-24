import jwt from 'jsonwebtoken'

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_KEY, {
    expiresIn: '8h'
  })
}

const verifyToken = (token, options = {}) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY, options)
    return decoded
  } catch (e) {
    if (e.expiredAt <= new Date()) {
      throw new Error('key expired')
    }
    return null
  }
}

export const validateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization?.split(' ')
    if (!authHeader) {
      throw new Error('Not found authorization header')
    }
    const authSchema = authHeader[0]
    const authToken = authHeader[1]
    const payload = verifyToken(authToken)
    if (!payload || authSchema !== 'Bearer') {
      throw new Error('Unauthorized')
    }
    res.locals.user = payload
    next()
  } catch (e) {
    res.status(401).send({ message: e.message })
  }
}
