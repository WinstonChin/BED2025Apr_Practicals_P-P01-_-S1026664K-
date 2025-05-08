const express = require("express");
const sql = require("mssql"); // Assuming you've installed mssql
const dbConfig = require("./dbConfig");

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default port

app.use(express.json()); // middleware inbuilt in express to recognize the incoming Request Object as a JSON Object.
app.use(express.urlencoded()); // middleware inbuilt in express to recognize the incoming Request Object as strings or arrays

app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();    
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});

// --- GET Routes  ---

// GET all books
app.get("/students", async (req, res) => {
    let connection; // Declare connection outside try for finally block
    try {
      connection = await sql.connect(dbConfig); // Get the database connection
      const sqlQuery = `SELECT student_id, name, address FROM Students`; // Select specific columns
      const request = connection.request();
      const result = await request.query(sqlQuery);
      res.json(result.recordset); // Send the result as JSON
    } catch (error) {
      console.error("Error in GET /students:", error);
      res.status(500).send("Error retrieving students"); // Send a 500 error on failure
    } finally {
      if (connection) {
        try {
          await connection.close(); // Close the database connection
        } catch (closeError) {
          console.error("Error closing database connection:", closeError);
        }
      }
    }
  });
  
  // GET book by ID
  app.get("/students/:id", async (req, res) => {
    const StudentId = parseInt(req.params.id);
    if (isNaN(StudentId)) {
      return res.status(400).send("Invalid student ID");
    }
  
    let connection;
    try {
      connection = await sql.connect(dbConfig); // Get the database connection
      const sqlQuery = `SELECT student_id, name, address FROM Students WHERE student_id = @student_id`;
      const request = connection.request();
      request.input("student_id", StudentId); // Bind the id parameter
      const result = await request.query(sqlQuery);
  
      if (!result.recordset[0]) {
        return res.status(404).send("Student not found");
      }
      res.json(result.recordset[0]); // Send the book data as JSON
    } catch (error) {
      console.error(`Error in GET /studens/${StudentId}:`, error);
      res.status(500).send("Error retrieving student");
    } finally {
      if (connection) {
        try {
          await connection.close(); // Close the database connection
        } catch (closeError) {
          console.error("Error closing database connection:", closeError);
        }
      }
    }
  });

  // --- POST Route  ---

// POST create new book
app.post("/students", async (req, res) => {
    const newStudentData = req.body; // Get new book data from request body
  
    // **WARNING:** No validation is performed here. Invalid data may cause database errors. We will implement the necessary validation in future practicals.
  
    let connection;
    try {
      connection = await sql.connect(dbConfig); // Get the database connection
      const sqlQuery = `INSERT INTO Students (name, address) VALUES (@name, @address); SELECT SCOPE_IDENTITY() AS student_id;`;
      const request = connection.request();
      // Bind parameters from the request body
      request.input("name", newStudentData.name);
      request.input("address", newStudentData.address);
      const result = await request.query(sqlQuery);
  
      // Attempt to fetch the newly created book to return it
      const newStudentId = result.recordset[0].student_id;
  
      // Directly fetch the new book here instead of calling a function
      // Re-using the same connection before closing it in finally
      const getNewStudentQuery = `SELECT student_id, name, address FROM Students WHERE student_id = @student_id`;
      const getNewStudentRequest = connection.request();
      getNewStudentRequest.input("student_id", newStudentId);
      const newStudentResult = await getNewStudentRequest.query(getNewStudentQuery);
  
      res.status(201).json(newStudentResult.recordset[0]); // Send 201 Created status and the new book data
    } catch (error) {
      console.error("Error in POST /students:", error);
      // Database errors due to invalid data (e.g., missing required fields) will likely be caught here
      res.status(500).send("Error creating student");
    } finally {
      if (connection) {
        try {
          await connection.close(); // Close the database connection
        } catch (closeError) {
          console.error("Error closing database connection:", closeError);
        }
      }
    }
  });

  app.put("/students/:id", async (req, res) => {
    const StudentId = parseInt(req.params.id);
    const { name, address } = req.body;
  
    if (isNaN(StudentId)) {
      return res.status(400).send("Invalid student ID");
    }
  
    if (!name || !address) {
      return res.status(400).send("name and address are required");
    }
  
    let connection;
    try {
      connection = await sql.connect(dbConfig);
  
      const updateQuery = `
        UPDATE Students
        SET name = @name, address = @address
        WHERE student_id = @student_id
      `;
  
      const request = connection.request();
      request.input("student_id", StudentId);
      request.input("name", name);
      request.input("address", address);
  
      const result = await request.query(updateQuery);
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).send("Student not found");
      }
  
      // Fetch and return the updated student
      const fetchQuery = `SELECT student_id, name, address FROM Students WHERE student_id = @student_id`;
      const fetchRequest = connection.request();
      fetchRequest.input("student_id", StudentId);
      const fetchResult = await fetchRequest.query(fetchQuery);
  
      res.status(200).json(fetchResult.recordset[0]);
    } catch (error) {
      console.error(`Error in PUT /students/${StudentId}:`, error);
      res.status(500).send("Error updating student");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error("Error closing database connection:", closeError);
        }
      }
    }
  });
  

// DELETE book by ID
app.delete("/students/:id", async (req, res) => {
    const StudentId = parseInt(req.params.id);
  
    if (isNaN(StudentId)) {
      return res.status(400).send("Invalid Student ID");
    }
  
    let connection;
    try {
      connection = await sql.connect(dbConfig); // Connect to database
  
      const deleteQuery = `DELETE FROM Students WHERE student_id = @student_id`;
      const request = connection.request();
      request.input("student_id", StudentId);
  
      const result = await request.query(deleteQuery);
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).send("Student not found");
      }
  
      // Successfully deleted
      res.status(204).send(); // No Content
    } catch (error) {
      console.error(`Error in DELETE /students/${StudentId}:`, error);
      res.status(500).send("Error deleting Student");
    } finally {
      if (connection) {
        try {
          await connection.close(); // Always close the connection
        } catch (closeError) {
          console.error("Error closing database connection:", closeError);
        }
      }
    }
  });
  