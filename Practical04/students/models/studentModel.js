const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Define column names as variables
const COLUMN_ID = "studentId";
const COLUMN_NAME = "name";
const COLUMN_ADDRESS = "address";

// Get all students
async function getAllStudents() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `SELECT ${COLUMN_ID}, ${COLUMN_NAME}, ${COLUMN_ADDRESS} FROM Students`;
    const result = await connection.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Get student by ID
async function getStudentById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `SELECT ${COLUMN_ID}, ${COLUMN_NAME}, ${COLUMN_ADDRESS} FROM Students WHERE ${COLUMN_ID} = @id`;
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Create new student
async function createStudent(studentData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO Students (${COLUMN_NAME}, ${COLUMN_ADDRESS})
      VALUES (@name, @address);
      SELECT SCOPE_IDENTITY() AS ${COLUMN_ID};
    `;
    const request = connection.request();
    request.input("name", studentData.name);
    request.input("address", studentData.address);
    const result = await request.query(query);

    const newStudentId = result.recordset[0][COLUMN_ID];
    return await getStudentById(newStudentId);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Update student by ID
async function updateStudent(id, studentData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE Students
      SET ${COLUMN_NAME} = @name, ${COLUMN_ADDRESS} = @address
      WHERE ${COLUMN_ID} = @id;
    `;
    const request = connection.request();
    request.input("id", id);
    request.input("name", studentData.name);
    request.input("address", studentData.address);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null;
    }

    return await getStudentById(id);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Delete student by ID
async function deleteStudent(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `DELETE FROM Students WHERE ${COLUMN_ID} = @id`;
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
