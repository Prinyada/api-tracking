import md5 from 'md5'
import axios from 'axios'
import pool, { dbreport } from '../database.js'
import s3 from '../connectS3.js'

export const getfile = (req, res) => {
  try {
    const file = req.body
    const params = {
      Bucket: 'ksp-tracking',
      // Bucket: 'test-tracking',
      Key: file.Key
    }
    s3.getSignedUrl('getObject', params, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.send(data)
      }
    })
  } catch (error) {
    res.status(500).send(error)
  }
}

export const getfileDone = (req, res) => {
  try {
    const file = req.body
    const params = {
      Bucket: 'ksp-tracking',
      // Bucket: 'test-tracking',
      Key: file.KeyDone
    }
    s3.getSignedUrl('getObject', params, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.send(data)
      }
    })
  } catch (error) {
    res.status(500).send(error)
  }
}

const formatDate = (date) => {
  const newDate = new Date(date)
  
  const year = newDate.getFullYear()
  const month = (parseInt(newDate.getMonth()) + 1) > 9 ? (parseInt(newDate.getMonth()) + 1) : '0' + (parseInt(newDate.getMonth()) + 1)
  const day = newDate.getDate() > 9 ? newDate.getDate() : '0' + newDate.getDate()

  return year + '-' + month + '-' + day 
}

export const addproblem = async (req, res) => {
  // upload.array('file')
  try {
    const {
      prefix,
      firstName,
      lastName,
      cardNumber,
      email,
      tel,
      detailProblem,
      refProblem
    } = req.body
    const file = req.files
    const payload = {
      prefix,
      firstName,
      lastName,
      cardNumber,
      email,
      tel,
      detailProblem,
      status: 'OPEN'
    }
    const [chkPrbm] = await pool.query(`SELECT id FROM problems WHERE 
                                      cardNumber = '${cardNumber}'
                                      AND detailProblem = '${detailProblem}'
                                      AND status = 'OPEN'`)
    if (chkPrbm.length !== 0) {
      return res.status(400).send('Duplicate Problems Error')
    }
    
    if(refProblem !== ''){
      payload.refProblem = refProblem
    }
    // const [data] = await pool.query('INSERT INTO problems SET ?', [payload])
    const [data] = await pool.query('INSERT INTO problems (prefix, firstName, lastName, cardNumber, email, tel, detailProblem, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
    [payload.prefix, payload.firstName, payload.lastName, payload.cardNumber, payload.email, payload.tel, payload.detailProblem, 'OPEN'])
    for (const key of file) {
      const indexkey = file.indexOf(key)
      const date = new Date()
      const typename = key.originalname.split('.')
      key.originalname = `${date.getFullYear()}/tc${data.insertId.toString().padStart(8, '0')}_${indexkey + 1}.${typename[typename.length - 1]}`
      await pool.query('INSERT INTO problemfile(problem_id, filePath) VALUES(?, ?)', [data.insertId, key.originalname])
      const params = {
        Bucket: 'ksp-tracking',
        // Bucket: 'test-tracking',
        Key: key.originalname,
        Body: key.buffer,
        ContentDisposition: 'inline',
        ContentType: key.mimetype
      }
      s3.upload(params, function (s3Err, data) {
        if (s3Err) {
          res.status(500).send('S3 Error')
        }
      })
    }
    // const [dateTimeOpen] = await pool.query('SELECT * FROM vProblems2 WHERE id = ?', data.insertId)
    // const [timeOpen] = dateTimeOpen
    // const message = {
    //   message: `OPEN \n หน่วยงาน: ${payload.company} \n track id: ${'tc' + data.insertId.toString().padStart(8, '0')} \n รอบวันที่ ${new Date(dateStart).toLocaleDateString('sv-SE')} - ${new Date(dateStop).toLocaleDateString('sv-SE')} \n ชื่อผู้แจ้ง: ${timeOpen.callcenter_firstName} ${timeOpen.callcenter_lastName} \n เวลาแจ้ง: ${new Date(timeOpen.create_open).toLocaleString('sv-SE')}`
    // }
    res.send(data)
  } catch (error) {
    res.status(500).send(error)
  }
}

export const adduser = async (req, res) => {
  try {
    const { prefix, firstName, lastName, username, password, level, accountId } = req.body
    const payload = {
      prefix,
      firstName,
      lastName,
      username,
      password,
      level,
      accountId
    }
    const decryptedPassword = md5(payload.password)
    const [data] = await pool.query('INSERT INTO accounts(prefix, firstName, lastName, username, password, accountId, level, status) VALUES(?, ?, ?, ?, ?, ?, ?, 1)', [payload.prefix, payload.firstName, payload.lastName, payload.username, decryptedPassword, payload.accountId, payload.level])
    res.status(200).send(data)
  } catch (error) {
    res.status(500).send(error)
  }
}

export const yearQuery = async (req, res) => {
  const { company, year, month, day } = req.body
  try {
    let open = 'SELECT MONTH(create_open) as month, COUNT(id) as count FROM vProblems2 WHERE status = "OPEN"'
    let process = 'SELECT MONTH(create_open) as month, COUNT(id) as count FROM vProblems2 WHERE status = "PROCESS"'
    let done = 'SELECT MONTH(create_open) as month, COUNT(id) as count FROM vProblems2 WHERE status = "DONE"'
    let complete = 'SELECT MONTH(create_open) as month, COUNT(id) as count FROM vProblems2 WHERE status = "COMPLETE"'
    const list = []
    if (company) {
      open += ' AND company = ?'
      process += ' AND company = ?'
      done += ' AND company = ?'
      complete += ' AND company = ?'
      list.push(company)
    }
    if (year) {
      open += ' AND date_format(create_open, "%Y") = ?'
      process += ' AND date_format(create_open, "%Y") = ?'
      done += ' AND date_format(create_open, "%Y") = ?'
      complete += ' AND date_format(create_open, "%Y") = ?'
      list.push(year)
    }
    if (month) {
      open += ' AND date_format(create_open, "%m") = ?'
      process += ' AND date_format(create_open, "%m") = ?'
      done += ' AND date_format(create_open, "%m") = ?'
      complete += ' AND date_format(create_open, "%m") = ?'
      list.push(month)
    }
    if (day) {
      open += ' AND date_format(create_open, "%d") = ?'
      process += ' AND date_format(create_open, "%d") = ?'
      done += ' AND date_format(create_open, "%d") = ?'
      complete += ' AND date_format(create_open, "%d") = ?'
      list.push(day)
    }
    open += ' GROUP BY month'
    process += ' GROUP BY month'
    done += ' GROUP BY month'
    complete += ' GROUP BY month'
    const [dataOpen] = await pool.query(open, list)
    const [dataProcess] = await pool.query(process, list)
    const [dataDone] = await pool.query(done, list)
    const [dataComplete] = await pool.query(complete, list)
    const openCount = dataOpen.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const processCount = dataProcess.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const doneCount = dataDone.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const completeCount = dataComplete.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const sum = openCount + processCount + doneCount + completeCount
    const dataStatus = {
      open: dataOpen,
      process: dataProcess,
      done: dataDone,
      complete: dataComplete,
      openCount,
      processCount,
      doneCount,
      completeCount,
      sum
    }
    res.send(dataStatus)
  } catch (error) {
    res.status(500).send(error)
  }
}

export const defaultGraphQuery = async (req, res) => {
  const { company } = req.body
  try {
    let open = 'SELECT DATE(create_open) as date, COUNT(id) as count FROM vProblems2 WHERE status = "OPEN"'
    let process = 'SELECT DATE(create_open) as date, COUNT(id) as count FROM vProblems2 WHERE status = "PROCESS"'
    let done = 'SELECT DATE(create_open) as date, COUNT(id) as count FROM vProblems2 WHERE status = "DONE"'
    let complete = 'SELECT DATE(create_open) as date, COUNT(id) as count FROM vProblems2 WHERE status = "COMPLETE"'
    const list = []
    if (company) {
      open += ' AND company = ?'
      process += ' AND company = ?'
      done += ' AND company = ?'
      complete += ' AND company = ?'
      list.push(company)
    }
    open += ' GROUP BY date'
    process += ' GROUP BY date'
    done += ' GROUP BY date'
    complete += ' GROUP BY date'
    const [dataOpen] = await pool.query(open, list)
    const [dataProcess] = await pool.query(process, list)
    const [dataDone] = await pool.query(done, list)
    const [dataComplete] = await pool.query(complete, list)
    const openCount = dataOpen.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const processCount = dataProcess.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const doneCount = dataDone.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const completeCount = dataComplete.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const sum = openCount + processCount + doneCount + completeCount
    const dataStatus = {
      open: dataOpen,
      process: dataProcess,
      done: dataDone,
      complete: dataComplete,
      openCount,
      processCount,
      doneCount,
      completeCount,
      sum
    }
    res.send(dataStatus)
  } catch (error) {
    res.status(500).send(error)
  }
}

export const yearMonthQuery = async (req, res) => {
  const { company, year, month } = req.body //, day
  try {
    let open = 'SELECT DATE(create_open) as date, COUNT(id) as count FROM vProblems2 WHERE status = "OPEN"'
    let process = 'SELECT DATE(create_open) as date, COUNT(id) as count FROM vProblems2 WHERE status = "PROCESS"'
    let done = 'SELECT DATE(create_open) as date, COUNT(id) as count FROM vProblems2 WHERE status = "DONE"'
    let complete = 'SELECT DATE(create_open) as date, COUNT(id) as count FROM vProblems2 WHERE status = "COMPLETE"'
    const list = []
    if (company) {
      open += ' AND company = ?'
      process += ' AND company = ?'
      done += ' AND company = ?'
      complete += ' AND company = ?'
      list.push(company)
    }
    if (year) {
      open += ' AND date_format(create_open, "%Y") = ?'
      process += ' AND date_format(create_open, "%Y") = ?'
      done += ' AND date_format(create_open, "%Y") = ?'
      complete += ' AND date_format(create_open, "%Y") = ?'
      list.push(year)
    }
    if (month) {
      open += ' AND date_format(create_open, "%m") = ?'
      process += ' AND date_format(create_open, "%m") = ?'
      done += ' AND date_format(create_open, "%m") = ?'
      complete += ' AND date_format(create_open, "%m") = ?'
      list.push(month)
    }
    open += ' GROUP BY date'
    process += ' GROUP BY date'
    done += ' GROUP BY date'
    complete += ' GROUP BY date'
    const [dataOpen] = await pool.query(open, list)
    const [dataProcess] = await pool.query(process, list)
    const [dataDone] = await pool.query(done, list)
    const [dataComplete] = await pool.query(complete, list)
    const openCount = dataOpen.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const processCount = dataProcess.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const doneCount = dataDone.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const completeCount = dataComplete.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const sum = openCount + processCount + doneCount + completeCount
    const dataStatus = {
      open: dataOpen,
      process: dataProcess,
      done: dataDone,
      complete: dataComplete,
      openCount,
      processCount,
      doneCount,
      completeCount,
      sum
    }
    res.send(dataStatus)
  } catch (error) {
    res.status(500).send(error)
  }
}

export const yearMonthDayQuery = async (req, res) => {
  const { company, year, month, day } = req.body
  // const payload = { company, year, month, day }
  const date = new Date()
  const monthCurrent = date.getMonth() + 1
  const yearCurrent = date.getFullYear()
  try {
    let open = 'SELECT DATE(create_open) as date, COUNT(id) as count FROM vProblems2 WHERE status = "OPEN"'
    let process = 'SELECT DATE(create_open) as date, COUNT(id) as count FROM vProblems2 WHERE status = "PROCESS"'
    let done = 'SELECT DATE(create_open) as date, COUNT(id) as count FROM vProblems2 WHERE status = "DONE"'
    let complete = 'SELECT DATE(create_open) as date, COUNT(id) as count FROM vProblems2 WHERE status = "COMPLETE"'
    const list = []
    if (company) {
      open += ' AND company = ?'
      process += ' AND company = ?'
      done += ' AND company = ?'
      complete += ' AND company = ?'
      list.push(company)
    }
    if (year) {
      open += ' AND date_format(create_open, "%Y") = ?'
      process += ' AND date_format(create_open, "%Y") = ?'
      done += ' AND date_format(create_open, "%Y") = ?'
      complete += ' AND date_format(create_open, "%Y") = ?'
      list.push(year)
    } else {
      open += ' AND date_format(create_open, "%Y") = ?'
      process += ' AND date_format(create_open, "%Y") = ?'
      done += ' AND date_format(create_open, "%Y") = ?'
      complete += ' AND date_format(create_open, "%Y") = ?'
      list.push(yearCurrent)
    }
    if (month) {
      open += ' AND date_format(create_open, "%m") = ?'
      process += ' AND date_format(create_open, "%m") = ?'
      done += ' AND date_format(create_open, "%m") = ?'
      complete += ' AND date_format(create_open, "%m") = ?'
      list.push(month)
    } else {
      open += ' AND date_format(create_open, "%m") = ?'
      process += ' AND date_format(create_open, "%m") = ?'
      done += ' AND date_format(create_open, "%m") = ?'
      complete += ' AND date_format(create_open, "%m") = ?'
      list.push(monthCurrent)
    }
    if (day) {
      open += ' AND date_format(create_open, "%d") = ?'
      process += ' AND date_format(create_open, "%d") = ?'
      done += ' AND date_format(create_open, "%d") = ?'
      complete += ' AND date_format(create_open, "%d") = ?'
      list.push(day)
    }
    open += ' GROUP BY date'
    process += ' GROUP BY date'
    done += ' GROUP BY date'
    complete += ' GROUP BY date'
    const [dataOpen] = await pool.query(open, list)
    const [dataProcess] = await pool.query(process, list)
    const [dataDone] = await pool.query(done, list)
    const [dataComplete] = await pool.query(complete, list)
    const openCount = dataOpen.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const processCount = dataProcess.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const doneCount = dataDone.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const completeCount = dataComplete.reduce((accumulator, object) => {
      return accumulator + object.count
    }, 0)
    const sum = openCount + processCount + doneCount + completeCount
    const dataStatus = {
      open: dataOpen,
      process: dataProcess,
      done: dataDone,
      complete: dataComplete,
      openCount,
      processCount,
      doneCount,
      completeCount,
      sum
    }
    res.send(dataStatus)
  } catch (error) {
    res.status(500).send(error)
  }
}

export const isUsernameAvailable = async (req, res) => {
  try {
    const { username } = req.body
    const [data] = await pool.query('SELECT * FROM accounts WHERE username = ?', [username])
    if (data.length) {
      res.send({ available: false })
      return
    }
    res.send({ available: true })
  } catch (error) {
    res.send(error)
  }
}

export const getLinkCompany = async (req, res) => {
  try {
    const {CompanyName , dateStart, dateStop} = req.body
    const [[data]] = await dbreport.query(`
                      SELECT CustTestURL AS url FROM dbreport.vTicket	
                      WHERE 
                        CustName = '${CompanyName}'
                        AND ODate = '${dateStart}'
                        AND CDate = '${dateStop}'
                      LIMIT 1
                    `)  
    res.status(200).send(data)
  } catch (error) {
    res.status(500).send(error)
  }
}

export const getproblemsbycardNumber = async (req, res) => {
  // :cardNumber
  try {
    const { cardNumber } = req.body;
    // const [data] = await pool.query('SELECT problem.*, keyfile.*, keyfiledone.filePath AS keyfiledone FROM problems as problem LEFT JOIN problemfile keyfile ON problem.id = keyfile.problem_id LEFT JOIN problemfile_done keyfiledone ON problem.id = keyfiledone.problem_id WHERE problem.id = ?', [id])
    const [data] = await pool.query(
      `SELECT
      problem.*,
      JSON_ARRAYAGG(filePath) AS filePath,
      accountsCC.prefix AS prefixCC,
      accountsCC.firstName AS firstNameCC,
      accountsCC.lastName AS lastNameCC,
      accountsDev.prefix AS prefixDev,
      accountsDev.firstName AS firstNameDev,
      accountsDev.lastName AS lastNameDev
  FROM
      problems AS problem 
  JOIN
      problemfile AS pf ON problem.id = pf.problem_id
  LEFT JOIN
      accounts AS accountsCC ON accountsCC.id = problem.accountIdCC
  LEFT JOIN
      accounts AS accountsDev ON accountsDev.id = problem.accountIdDev
  WHERE
      problem.cardNumber = ?
  GROUP BY
      problem.id`,
      [cardNumber]
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};