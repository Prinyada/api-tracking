import { Router } from 'express'
import multer from 'multer'
import { getfile, addproblem, adduser, yearQuery, yearMonthQuery, yearMonthDayQuery, defaultGraphQuery, isUsernameAvailable, getLinkCompany, getfileDone, getproblemsbycardNumber } from '../controllers/post.controllers.js'
import { validateToken } from '../auth/auth.services.js'

const router = Router()
const storageFile = multer.memoryStorage()
const upload = multer({
  storage: storageFile
})
router.post('/getfile', validateToken, getfile)
router.post('/getfileDone', validateToken, getfileDone)
router.post('/addproblem', upload.array('file'), addproblem)
router.post('/adduser', validateToken, adduser)
router.post('/yearQuery', validateToken, yearQuery)
router.post('/yearMonthQuery', validateToken, yearMonthQuery)
router.post('/yearMonthDayQuery', validateToken, yearMonthDayQuery)
router.post('/defaultGraphQuery', validateToken, defaultGraphQuery)
router.post('/isUsernameAvailable', validateToken, isUsernameAvailable)
router.post('/getLinkCompany', validateToken, getLinkCompany)

router.post('/getproblemsbycardNumber',validateToken, getproblemsbycardNumber)

export default router
