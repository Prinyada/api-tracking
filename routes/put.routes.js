import { Router } from 'express'
import { updateprocess, updatedev, updatecomplete, updatedone, updateuser, cancelcase, updatedevprocess, updatecasedev, updatecase } from '../controllers/put.controllers.js'
import { validateToken } from '../auth/auth.services.js'
import multer from 'multer'
const router = Router()
const storageFile = multer.memoryStorage()
const upload = multer({
  storage: storageFile
})

// เฉพาะ BD เท่านั้น
router.put('/updateprocess/', validateToken, updateprocess)
router.put('/updatecomplete',validateToken, updatecomplete)
router.put('/updatecase/:id', validateToken, updatecase)

// ของเดิม
router.put('/updateuser/:id', validateToken, updateuser)
router.put('/cancelcase/:id', cancelcase)

// เฉพาะ dev เท่านั้น
router.put('/updatedev/:id', validateToken, updatedev)
router.put('/updatedevprocess/:id', validateToken, updatedevprocess)
router.put('/updatedone',validateToken, updatedone)
router.put('/updatecasedev/:id', validateToken, updatecasedev) 

export default router
