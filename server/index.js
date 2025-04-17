// Load environment variables from .env file
require("dotenv").config();
const express = require("express");
const path = require("path");
const pg = require("pg");
const fs = require("fs");

// Create the Express app
const app = express();
// Define the port the server will listen on
const PORT = process.env.PORT || 3000;

// Middleware to serve static files from the 'client/dist' directory
app.use(express.static(path.join(__dirname, "..", "client", "dist")));

// Route to serve the main index.html file for the root URL
app.get("/", (req, res) => {
  // Use separate arguments for path.join here too
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
});

// API route to get all employees
app.get("/api/employees", async (req, res, next) => {
  try {
    // SQL query to select all employees
    const SQL = `SELECT * FROM employees;`;
    // Execute the query using the connected client
    const response = await client.query(SQL);
    // Send the rows back as JSON
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

const setupQuery = `
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);
INSERT INTO employees(name, is_admin) VALUES('John Doe', TRUE);
INSERT INTO employees(name, is_admin) VALUES('Jane Doe', FALSE);
INSERT INTO employees(name) VALUES('John Smith'); -- is_admin defaults to false
`;

const init = async () => {
  console.log("Connecting to database...");
  try {
    await client.connect();
    console.log("Connected to database successfully!");

    console.log("Running setup script...");
    await client.query(setupQuery);
    console.log("Database setup and seeding complete!");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error during database initialization:", error);
    process.exit(1);
  }
};

init();
