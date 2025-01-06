// ✅ Importing Required Packages (ES Module Syntax)
import express from 'express';
import mysql from 'mysql2/promise'; // Using promise-based MySQL for better async handling
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import helmet from 'helmet';
import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Initialize Express App and Middleware
const app = express();
app.use(express.json({ limit: '1mb' })); 
app.use(cors());
app.use(helmet());

// ✅ Correct MySQL Connection Using Promises
const db = await mysql.createConnection({
    host: process.env.DB_HOST || "bboai925bg2h7iyfqvwh-mysql.services.clever-cloud.com",
    user: process.env.DB_USER || "u5pcka2rnhj9wq1h",
    password: process.env.DB_PASSWORD || "gBNlNTNYXhNn47HHFmNI",
    database: process.env.DB_NAME || "bboai925bg2h7iyfqvwh",
    port: 3306
});

// ✅ Check Database Connection
try {
    await db.connect();
    console.log("✅ Connected to MySQL database.");
} catch (err) {
    console.error("❌ Error connecting to the database:", err);
    process.exit(1); // Exit if database connection fails
}

// ✅ JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Joi Validation Schema
const transactionSchema = Joi.object({
    title: Joi.string().min(2).max(50).required(),
    amount: Joi.number().positive().required(),
    type: Joi.string().valid("income", "expense").required(),
    date: Joi.date().iso().required(),
});

// ✅ JWT Authentication Middleware
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

// ✅ Get Transactions with Pagination and Error Handling
app.get("/api/v1/transactions", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        if (limit <= 0 || offset < 0) {
            return res.status(416).json({ message: "Invalid range parameters provided." });
        }

        // Count total transactions
        const [countResult] = await db.query(`SELECT COUNT(*) AS total FROM transactions WHERE user_id = ?`, [userId]);
        const totalRecords = countResult[0].total;

        if (offset >= totalRecords) {
            return res.status(416).json({ message: "Requested range exceeds total records." });
        }

        // Fetch transactions with pagination
        const [results] = await db.query(
            `SELECT id, title, amount, type, DATE_FORMAT(date, '%Y-%m-%d') AS date 
             FROM transactions WHERE user_id = ? 
             ORDER BY date DESC LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        res.json({
            transactions: results,
            totalRecords,
            nextOffset: offset + limit < totalRecords ? offset + limit : null
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Add Transaction Route with Validation and Error Handling
app.post("/api/v1/transactions", authenticateJWT, async (req, res) => {
    const { error } = transactionSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { title, amount, type, date } = req.body;
    const userId = req.user.id;

    try {
        const [result] = await db.query(
            "INSERT INTO transactions (user_id, title, amount, type, date) VALUES (?, ?, ?, ?, ?)",
            [userId, title, amount, type, date]
        );
        res.status(201).json({ message: "Transaction added successfully!", id: result.insertId });
    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({ message: "Error adding transaction." });
    }
});

// ✅ User Registration Route
app.post("/api/v1/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Registration error" });
    }
});

// ✅ User Login Route with JWT Token Generation
app.post("/api/v1/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: "User not found." });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ message: "An unexpected error occurred." });
});

// ✅ Server Start with Proper Logging
const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});
