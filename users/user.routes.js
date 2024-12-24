import { Router } from 'express'
import { validateToken } from '../auth/auth.services.js'
import { getProfileController } from './user.controllers.js'

const router = Router()
router.get('/me', validateToken, getProfileController)

export default router
