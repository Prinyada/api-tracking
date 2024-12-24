import { Router } from 'express'
import { delUser } from '../controllers/delete.controllers.js'
import { validateToken } from '../auth/auth.services.js'
const router = Router()

router.delete('/delUser/:id', validateToken, delUser)

export default router
