import { Router } from 'express'
import { validateToken } from '../auth/auth.services.js'
import { empById, getproblems, problemsbyuser, getaccounts, getaccountid, getproblemsid, getrole, getproblemsasc, problemsbyuserasc, getitemerror, getProblemsRef, getproblemsfordev, getproblemsprocessfordev, getproblemsdonefordev, problemscompletefordev, problemsallfordev, problemscompleteforbd, problemscompletebyuser, problemscompletebyid, getproblemsopen } from '../controllers/get.controllers.js'
const router = Router()

router.get('/getproblems', validateToken, getproblems)
router.get('/getproblemsopen', validateToken, getproblemsopen)
router.get('/getproblemsasc', validateToken, getproblemsasc)
router.get('/problemsbyuser/:id', validateToken, problemsbyuser)
router.get('/problemsbyuserasc/:id', validateToken, problemsbyuserasc)
router.get('/getaccounts', validateToken, getaccounts)
router.get('/empById/:id', validateToken, empById)
router.get('/getaccountid/:id', validateToken, getaccountid)
router.get('/getproblemsid/:id', validateToken, getproblemsid)
router.get('/getrole', validateToken, getrole)
router.get('/getitemerror', validateToken, getitemerror)
router.get('/getProblemsRef', validateToken, getProblemsRef)

//เฉพาะ BD
router.get('/problemscompleteforbd',validateToken, problemscompleteforbd)
router.get('/problemscompletebyid/:id',validateToken, problemscompletebyid)

// เฉพาะ dev เท่านั้น
router.get('/getproblemsfordev',validateToken, getproblemsfordev) // BD ส่งมาให้ dev ทำ
router.get('/getproblemsprocessfordev',validateToken, getproblemsprocessfordev) // dev กำลังทำ
router.get('/getproblemsdonefordev',validateToken, getproblemsdonefordev) // dev กำลังทำ
router.get('/problemscompletefordev',validateToken, problemscompletefordev) // dev ทำเสร็จแล้ว
router.get('/problemsallfordev',validateToken, problemsallfordev)
router.get('/problemscompletebyuser/:id',validateToken, problemscompletebyuser)

export default router