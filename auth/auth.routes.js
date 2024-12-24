import { Router } from 'express'
import { loginController } from './auth.controllers.js'

const router = Router()

router.post('/login', loginController)

export default router
