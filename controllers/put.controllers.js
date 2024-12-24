import md5 from 'md5'
import axios from 'axios'
import pool from '../database.js'
import s3 from '../connectS3.js'

// BD Process
export const updateprocess = async (req, res) => {
  // :id
  try {
    const { id, accountIdCC } = req.body
    const [data] = await pool.query('UPDATE problems SET status = "BD PROCESS", statusdev = 0, accountIdCC = ?, create_process = NOW() WHERE id = ?', [accountIdCC, id])
    const [dev] = await pool.query('SELECT * FROM vProblems2 WHERE id = ?', [id])
    const [dataDev] = dev
    const message = {
      message: `PROCESS \n หน่วยงาน: ${dataDev.company} \n track id: ${'tc' + id.toString().padStart(8, '0')} \n ผู้รับเรื่อง: ${dataDev.dev_firstName} ${dataDev.dev_lastName} \n เวลาเริ่มดำเนินการ: ${new Date(dataDev.create_process).toLocaleString('sv-SE')}`
    }
    // await axios.post('https://notify-api.line.me/api/notify', message, { headers: { Authorization: `Bearer ${process.env.LINE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' } })
    // if (Number(dataDev.statustdcp) === 1) {
    //   await axios.post('https://notify-api.line.me/api/notify', message, { headers: { Authorization: `Bearer ${process.env.LINE_TDCP}`, 'Content-Type': 'application/x-www-form-urlencoded' } })
    // }
    res.status(200).send(data)
  } catch (error) {
    res.status(500).send(error)
  }
}

// BD complete
export const updatecomplete = async (req, res) => {
  try {
    const { id, typeError, detailError } = req.body;
    const [data] = await pool.query('UPDATE problems SET status = "COMPLETE", create_complete = NOW(), typeError=?, detailError=? WHERE id = ?', [typeError, detailError, id]);
    
    const [dataDone] = await pool.query('SELECT * FROM vProblems2 WHERE id = ?', [id]);
    const [done] = dataDone;
    const message = {
      message: `COMPLETE \n หน่วยงาน: ${done.company} \n track id: ${'tc' + id.toString().padStart(8, '0')} \n ผู้ดำเนินการ: ${done.dev_firstName} ${done.dev_lastName} \n เสร็จสิ้นเวลา: ${new Date(
        done.create_done
      ).toLocaleString('sv-SE')}`,
    };
    // await axios.post('https://notify-api.line.me/api/notify', message, { headers: { Authorization: `Bearer ${process.env.LINE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' } });
    // if (Number(done.statustdcp) === 1) {
    //   await axios.post('https://notify-api.line.me/api/notify', message, { headers: { Authorization: `Bearer ${process.env.LINE_TDCP}`, 'Content-Type': 'application/x-www-form-urlencoded' } });
    // }
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
}

// BD เป็นคนทำเอง
export const updatecase = async (req, res) => {
  // :id
  try {
    const { id } = req.params
    const [data] = await pool.query('UPDATE problems SET statusdev = 0 WHERE id = ?', [id])
    const [dev] = await pool.query('SELECT * FROM vProblems2 WHERE id = ?', [id])
    const [dataDev] = dev
    const message = {
      message: `OPEN \n หน่วยงาน: ${dataDev.company} \n track id: ${'tc' + id.toString().padStart(8, '0')} \n รอบวันที่ ${new Date(dataDev.dateStart).toLocaleDateString('sv-SE')} - ${new Date(dataDev.dateStop).toLocaleDateString('sv-SE')} \n ชื่อผู้แจ้ง: ${dataDev.callcenter_firstName} ${dataDev.callcenter_lastName} \n เวลาแจ้ง: ${new Date(dataDev.create_open).toLocaleString('sv-SE')}`
    }
      // await axios.post('https://notify-api.line.me/api/notify', message, { headers: { Authorization: `Bearer ${process.env.LINE_TDCP}`, 'Content-Type': 'application/x-www-form-urlencoded' } })
    res.status(200).send(data)
  } catch (error) {
    res.status(500).send(error)
  }
}

// ----------- เฉพาะ dev เท่านั้น ---------------- // 

// BD ส่งให้ DEV
export const updatedev = async (req, res) => {
  // :id
  try {
    const { id, accountIdCC } = req.body
    const [data] = await pool.query('UPDATE problems SET status = "DEV", accountIdCC = ?, create_dev = NOW() WHERE id = ?', [ accountIdCC, id ])
    const [dataDev] = await pool.query('SELECT * FROM vProblems2 WHERE id = ?', [id])
    const [dev] = dataDev
    const message = {
      message: `DEV \n หน่วยงาน: ${dev.company} \n track id: ${'tc' + id.toString().padStart(8, '0')} \n ผู้ดำเนินการ: ${dev.callcenter_firstName} ${dev.callcenter_lastName} \n วันปิดงาน: ${new Date(dev.create_complete).toLocaleString('sv-SE')}`
    }
    // await axios.post('https://notify-api.line.me/api/notify', message, { headers: { Authorization: `Bearer ${process.env.LINE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' } })
    // if (Number(complete.statustdcp) === 1) {
    //   await axios.post('https://notify-api.line.me/api/notify', message, { headers: { Authorization: `Bearer ${process.env.LINE_TDCP}`, 'Content-Type': 'application/x-www-form-urlencoded' } })
    // }
    res.status(200).send(data)
  } catch (error) {
    res.status(500).send(error)
  }
}

export const updatedevprocess = async (req, res) => {
  // :id
  try {
    const { id, accountIdDev } = req.body
    const [data] = await pool.query('UPDATE problems SET status = "DEV PROCESS", accountIdDev = ?, create_process = NOW() WHERE id = ?', [accountIdDev, id])
    const [dataDev] = await pool.query('SELECT * FROM vProblems2 WHERE id = ?', [id])
    const [dev] = dataDev
    const message = {
      message: `DEV PROCESS \n หน่วยงาน: ${dev.company} \n track id: ${'tc' + id.toString().padStart(8, '0')} \n ผู้ดำเนินการ: ${dev.callcenter_firstName} ${dev.callcenter_lastName} \n วันปิดงาน: ${new Date(dev.create_complete).toLocaleString('sv-SE')}`
    }
    // await axios.post('https://notify-api.line.me/api/notify', message, { headers: { Authorization: `Bearer ${process.env.LINE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' } })
    // if (Number(complete.statustdcp) === 1) {
    //   await axios.post('https://notify-api.line.me/api/notify', message, { headers: { Authorization: `Bearer ${process.env.LINE_TDCP}`, 'Content-Type': 'application/x-www-form-urlencoded' } })
    // }
    res.status(200).send(data)
  } catch (error) {
    res.status(500).send(error)
  }
}

// DEV & BD update done
export const updatedone = async (req, res) => {
  try {
    const { id, typeError, detailError } = req.body;
    const [data] = await pool.query('UPDATE problems SET status = "DONE", create_done = NOW(), typeError=?, detailError=? WHERE id = ?', [typeError, detailError, id]);
    
    const [dataDone] = await pool.query('SELECT * FROM vProblems2 WHERE id = ?', [id]);
    const [done] = dataDone;
    const message = {
      message: `DONE \n หน่วยงาน: ${done.company} \n track id: ${'tc' + id.toString().padStart(8, '0')} \n ผู้ดำเนินการ: ${done.dev_firstName} ${done.dev_lastName} \n เสร็จสิ้นเวลา: ${new Date(
        done.create_done
      ).toLocaleString('sv-SE')}`,
    };
    // await axios.post('https://notify-api.line.me/api/notify', message, { headers: { Authorization: `Bearer ${process.env.LINE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' } });
    // if (Number(done.statustdcp) === 1) {
    //   await axios.post('https://notify-api.line.me/api/notify', message, { headers: { Authorization: `Bearer ${process.env.LINE_TDCP}`, 'Content-Type': 'application/x-www-form-urlencoded' } });
    // }
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

// dev เป็นคนทำ statusdev = 1
export const updatecasedev = async (req, res) => {
  // :id
  try {
    const { id } = req.params
    const [data] = await pool.query('UPDATE problems SET statusdev = 1 WHERE id = ?', [id])
    const [dev] = await pool.query('SELECT * FROM vProblems2 WHERE id = ?', [id])
    const [dataDev] = dev
    const message = {
      message: `OPEN \n หน่วยงาน: ${dataDev.company} \n track id: ${'tc' + id.toString().padStart(8, '0')} \n รอบวันที่ ${new Date(dataDev.dateStart).toLocaleDateString('sv-SE')} - ${new Date(dataDev.dateStop).toLocaleDateString('sv-SE')} \n ชื่อผู้แจ้ง: ${dataDev.callcenter_firstName} ${dataDev.callcenter_lastName} \n เวลาแจ้ง: ${new Date(dataDev.create_open).toLocaleString('sv-SE')}`
    }
      // await axios.post('https://notify-api.line.me/api/notify', message, { headers: { Authorization: `Bearer ${process.env.LINE_TDCP}`, 'Content-Type': 'application/x-www-form-urlencoded' } })
    res.status(200).send(data)
  } catch (error) {
    res.status(500).send(error)
  }
}

// ของเดิม
export const updateuser = async (req, res) => {
  // :id
  try {
    const { id } = req.params
    const { prefix, firstName, lastName, username, password, accountId, level } = req.body
    const payload = { prefix, firstName, lastName, username, password, accountId, level }
    if (password === null) {
      const [data] = await pool.query('UPDATE accounts SET prefix=?, firstName=?, lastName=?, username=?, accountId=?, level=? WHERE id = ?', [payload.prefix, payload.firstName, payload.lastName, payload.username, payload.accountId, payload.level, id])
      res.status(200).send(data)
    } else {
      const decryptedPassword = md5(payload.password)
      const [data] = await pool.query('UPDATE accounts SET prefix=?, firstName=?, lastName=?, username=?, password=?, accountId=?, level=? WHERE id = ?', [payload.prefix, payload.firstName, payload.lastName, payload.username, decryptedPassword, payload.accountId, payload.level, id])
      res.status(200).send(data)
    }
  } catch (error) {
    res.status(500).send(error)
  }
}

export const cancelcase = async (req, res) => {
  // :id
  try {
    const { id } = req.params
    const [data] = await pool.query('UPDATE problems SET status = "OPEN", create_process = NULL, accountIdDev = NULL WHERE id = ?', [id])
    res.status(200).send(data)
  } catch (error) {
    res.status(500).send(error)
  }
}