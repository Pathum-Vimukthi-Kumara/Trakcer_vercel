const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const Joi = require("joi"); // Validation library
require("dotenv").config();

// Create Express app
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Create MySQL connection
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "test",
// });
const db = mysql.createConnection({
  host: "bboai925bg2h7iyfqvwh-mysql.services.clever-cloud.com",
  user: "u5pcka2rnhj9wq1h",
  password: "gBNlNTNYXhNn47HHFmNI",  // Replace with your actual password
  database: "bboai925bg2h7iyfqvwh",
  port: 3306
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error("Could not connect to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");
});

// JWT Secret Key

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Middleware to authenticate JWT




// **Validation Schemas**
const userSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const transactionSchema = Joi.object({
  title: Joi.string().min(2).max(50).required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid("income", "expense").required(),
  date: Joi.date().required(),
});


// **Routes**

// Register Route
app.post("/register", async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Error checking user existence:", err);
      return res.status(500).json({ message: "Internal server error." });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      (err) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res.status(500).json({ message: "Error registering user." });
        }
        res.status(201).json({ message: "User registered successfully!" });
      }
    );
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Check if the user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = results[0];

    // Compare password with hashed password in DB
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.json({ message: 'Login successful', token });
  });
});

// Protect routes using JWT middleware (for example, to view user profile)
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied, token missing." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }
    req.user = user; // Attach user information to the request object
    next();
  });
};

app.get("/api/v1/transactions", authenticateJWT, (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT 
      id, 
      title, 
      amount, 
      type, 
      DATE_FORMAT(date, '%Y-%m-%d') AS date 
    FROM transactions 
    WHERE user_id = ? 
    ORDER BY date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching transactions:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json(results);
  });
});

// Add Transaction
app.post("/api/v1/transactions", authenticateJWT, (req, res) => {
  const { error } = transactionSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { title, amount, type, date } = req.body;
  const userId = req.user.id;

  const query = "INSERT INTO transactions (user_id, title, amount, type, date) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [userId, title, amount, type, date], (err, results) => {
    if (err) {
      console.error("Error adding transaction:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(201).json({ id: results.insertId, title, amount, type, date });
  });
});

// Update Transaction
app.put("/api/v1/transactions/:id", authenticateJWT, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, amount, type, date } = req.body;

  const { error } = transactionSchema.validate({ title, amount, type, date });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const updateQuery = `
    UPDATE transactions 
    SET title = ?, amount = ?, type = ?, date = ? 
    WHERE id = ? AND user_id = ?
  `;

  db.query(updateQuery, [title, amount, type, date, id, userId], (err, results) => {
    if (err) {
      console.error("Error updating transaction:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Transaction not found or does not belong to the user." });
    }

    res.json({ message: "Transaction updated successfully." });
  });
});

// Delete Transaction
app.delete("/api/v1/transactions/:id", authenticateJWT, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const query = "DELETE FROM transactions WHERE id = ? AND user_id = ?";
  db.query(query, [id, userId], (err, results) => {
    if (err) {
      console.error("Error deleting transaction:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Transaction not found." });
    }
    res.json({ message: "Transaction deleted successfully." });
  });
});


// Start Server
const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
