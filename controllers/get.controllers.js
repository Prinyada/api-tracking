import pool, { dbcompany, dbreport } from "../database.js";

export const getproblems = async (req, res) => {
  try {
    const [data] = await pool.query(
      "SELECT * FROM vProblems2 ORDER BY update_at DESC"
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getproblemsopen = async (req, res) => {
  try {
    const [data] = await pool.query(
      'SELECT * FROM vProblems2 WHERE `status` = "OPEN" ORDER BY create_at ASC'
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

// ---------- เฉพาะเคสของ BD ------------- //

// แสดงที่ BD ทำเสร็จแล้ว
export const problemscompleteforbd = async (req, res) => {
  try {
    const [data] = await pool.query(
      'SELECT * FROM vProblems2 WHERE statusdev = 0 and `status` = "COMPLETE" ORDER BY update_at DESC'
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const problemscompletebyid = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await pool.query(
      'SELECT * FROM vProblems2 WHERE ( `status` = "COMPLETE" or `status` = "DONE" ) and accountIdCC = ? ORDER BY update_at DESC',
      [id]
    );

    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

// ------ เฉพาะเคสของ dev ------------ //

// BD ส่งมาให้ dev ทำ
export const getproblemsfordev = async (req, res) => {
  try {
    const [data] = await pool.query(
      'SELECT * FROM vProblems2 WHERE `status` = "DEV" ORDER BY update_at DESC'
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

// dev กำลังทำ
export const getproblemsprocessfordev = async (req, res) => {
  try {
    const [data] = await pool.query(
      'SELECT * FROM vProblems2 WHERE statusdev = 1 and `status` = "DEV PROCESS" ORDER BY update_at DESC'
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

// dev ทำเสร็จแล้ว
export const getproblemsdonefordev = async (req, res) => {
  try {
    const [data] = await pool.query(
      'SELECT * FROM vProblems2 WHERE statusdev = 1 and `status` = "DONE" ORDER BY update_at DESC'
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

// แสดงที่ dev ทำเสร็จแล้ว
export const problemscompletefordev = async (req, res) => {
  try {
    const [data] = await pool.query(
      'SELECT * FROM vProblems2 WHERE statusdev = 1 and (`status` = "COMPLETE" or `status` = "DONE") ORDER BY update_at DESC'
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const problemscompletebyuser = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await pool.query(
      'SELECT * FROM vProblems2 WHERE statusdev = 1 and ( `status` = "COMPLETE" or `status` = "DONE" ) and ( accountIdCC = ? or accountIdDev = ? ) ORDER BY update_at DESC',
      [id, id]
    );

    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

// แสดงภาพรวมของ dev
export const problemsallfordev = async (req, res) => {
  try {
    const [data] = await pool.query(
      "SELECT * FROM vProblems2 WHERE statusdev = 1 ORDER BY update_at DESC"
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getproblemsasc = async (req, res) => {
  try {
    const [data] = await pool.query(
      "SELECT * FROM vProblems2 ORDER BY update_at"
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const problemsbyuser = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await pool.query(
      "SELECT * FROM vProblems2 WHERE accountIdCC = ? OR accountIdDev = ? ORDER BY update_at DESC",
      [id, id]
    );

    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const problemsbyuserasc = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await pool.query(
      "SELECT * FROM vProblems2 WHERE accountIdCC = ? OR accountIdDev = ? ORDER BY update_at",
      [id, id]
    );
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getaccounts = async (req, res) => {
  try {
    const [data] = await pool.query(
      "SELECT * FROM accounts as users, role as role WHERE users.level = role.role_id AND status = 1"
    );
    const dataset = data.map((item) => {
      return {
        id: item.id,
        accountId: item.accountId,
        prefix: item.prefix,
        firstName: item.firstName,
        lastName: item.lastName,
        username: item.username,
        password: item.password,
        role: {
          role: item.role,
          role_id: item.role_id,
        },
      };
    });
    res.status(200).send(dataset);
  } catch (error) {
    res.send(error);
  }
};

export const getaccountid = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await pool.query(
      "SELECT * FROM accounts as users, role as role WHERE users.level = role.role_id AND status = 1 AND accountId = ?",
      [id]
    );
    res.status(200).send(data);
  } catch (error) {
    res.send(error);
  }
};

export const empById = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await pool.query(
      "SELECT * FROM accounts as users, role as role WHERE users.level = role.role_id AND status = 1 AND id = ?",
      [id]
    );
    res.status(200).send(data);
  } catch (error) {
    res.send(error);
  }
};

export const getrole = async (req, res) => {
  try {
    const [data] = await pool.query("SELECT * FROM role");
    res.status(200).send(data);
  } catch (error) {
    res.send(error);
  }
};

export const getproblemsid = async (req, res) => {
  // :id
  try {
    const { id } = req.params;
    // const [data] = await pool.query('SELECT problem.*, keyfile.*, keyfiledone.filePath AS keyfiledone FROM problems as problem LEFT JOIN problemfile keyfile ON problem.id = keyfile.problem_id LEFT JOIN problemfile_done keyfiledone ON problem.id = keyfiledone.problem_id WHERE problem.id = ?', [id])
    const [data] = await pool.query(
      `SELECT
      problem.*,
      keyfile.*,
      accountsCC.prefix AS prefixCC,
      accountsCC.firstName AS firstNameCC,
      accountsCC.lastName AS lastNameCC,
      accountsDev.prefix AS prefixDev,
      accountsDev.firstName AS firstNameDev,
      accountsDev.lastName AS lastNameDev
  FROM
      problems AS problem
  LEFT JOIN
      problemfile AS keyfile ON problem.id = keyfile.problem_id
  LEFT JOIN
      accounts AS accountsCC ON accountsCC.id = problem.accountIdCC
  LEFT JOIN
      accounts AS accountsDev ON accountsDev.id = problem.accountIdDev
  WHERE
      problem.id = ?;`,
      [id]
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getitemerror = async (req, res) => {
  try {
    const [data] = await pool.query("SELECT * FROM itemerror ORDER BY id ASC");
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getProblemsRef = async (req, res) => {
  try {
    const [data] = await pool.query(`
                    SELECT 
                      id, 
                      detailProblem 
                    FROM problems 
                    ORDER BY update_at DESC`);
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};