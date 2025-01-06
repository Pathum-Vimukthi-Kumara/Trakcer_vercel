const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const Joi = require("joi"); // Validation library
require("dotenv").config();

// Create Express app with optimized settings for Vercel
const app = express();
app.use(express.json({ limit: '1mb' })); // Limiting payload size
app.use(cors());
app.use(helmet());

// Create MySQL connection with environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST || "bboai925bg2h7iyfqvwh-mysql.services.clever-cloud.com",
    user: process.env.DB_USER || "u5pcka2rnhj9wq1h",
    password: process.env.DB_PASSWORD || "gBNlNTNYXhNn47HHFmNI",
    database: process.env.DB_NAME || "bboai925bg2h7iyfqvwh",
    port: 3306
});

// Connect to MySQL database with error handling
db.connect((err) => {
    if (err) {
        console.error("Could not connect to the database:", err);
        return;
    }
    console.log("Connected to the MySQL database.");
});

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

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
    date: Joi.date().iso().required(),
});

// **JWT Authentication Middleware**
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Access denied, token missing." });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token." });
        }
        req.user = user;
        next();
    });
};

// **Register Route**
app.post("/register", async (req, res) => {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error." });
        if (results.length > 0) return res.status(400).json({ message: "Email already in use." });

        const hashedPassword = bcrypt.hashSync(password, 8);
        db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], (err) => {
            if (err) return res.status(500).json({ message: "Error registering user." });
            res.status(201).json({ message: "User registered successfully!" });
        });
    });
});

// **Login Route**
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ message: 'User not found' });

        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ message: 'Login successful', token });
    });
});

// **Get Transactions Route with Pagination**
app.get("/api/v1/transactions", authenticateJWT, (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;  // Added pagination for payload control
    const query = `
      SELECT id, title, amount, type, DATE_FORMAT(date, '%Y-%m-%d') AS date 
      FROM transactions 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT ?
    `;

    db.query(query, [userId, limit], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching transactions." });
        res.json(results);
    });
});

// **Add Transaction**
app.post("/api/v1/transactions", authenticateJWT, (req, res) => {
    const { error } = transactionSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { title, amount, type, date } = req.body;
    const userId = req.user.id;

    const query = "INSERT INTO transactions (user_id, title, amount, type, date) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [userId, title, amount, type, date], (err, results) => {
        if (err) return res.status(500).json({ message: "Error adding transaction." });
        res.status(201).json({ id: results.insertId, title, amount, type, date });
    });
});

// **Error Handling Middleware for Unexpected Errors**
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "An unexpected error occurred." });
});

// **Start Server**
const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
