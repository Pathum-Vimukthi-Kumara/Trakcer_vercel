// Using ES Module Imports (No require)
import express from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import helmet from 'helmet';
import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' })); 
app.use(cors());
app.use(helmet());

// ✅ Corrected MySQL Connection Using ES Module
const db = mysql.createConnection({
    host: process.env.DB_HOST || "bboai925bg2h7iyfqvwh-mysql.services.clever-cloud.com",
    user: process.env.DB_USER || "u5pcka2rnhj9wq1h",
    password: process.env.DB_PASSWORD || "gBNlNTNYXhNn47HHFmNI",
    database: process.env.DB_NAME || "bboai925bg2h7iyfqvwh",
    port: 3306
});

// ✅ Handling MySQL Connection Errors
db.connect((err) => {
    if (err) {
        console.error("Could not connect to the database:", err);
        process.exit(1); // Exit the process if the connection fails
    }
    console.log("Connected to the MySQL database.");
});

// ✅ JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Validation Schema Using Joi
const transactionSchema = Joi.object({
    title: Joi.string().min(2).max(50).required(),
    amount: Joi.number().positive().required(),
    type: Joi.string().valid("income", "expense").required(),
    date: Joi.date().iso().required(),
});

// ✅ JWT Authentication Middleware with Error Handling
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

// ✅ Enhanced Transactions Route with Pagination
app.get("/api/v1/transactions", authenticateJWT, (req, res) => {
    const userId = req.user.id;
    let limit = parseInt(req.query.limit) || 10;
    let offset = parseInt(req.query.offset) || 0;

    if (limit <= 0 || offset < 0) {
        return res.status(416).json({ message: "Invalid range parameters provided." });
    }

    // Count transactions before fetching
    const countQuery = `SELECT COUNT(*) AS total FROM transactions WHERE user_id = ?`;
    db.query(countQuery, [userId], (err, countResult) => {
        if (err) return res.status(500).json({ message: "Error fetching transaction count." });
        
        const totalRecords = countResult[0].total;
        if (offset >= totalRecords) {
            return res.status(416).json({ message: "Requested range exceeds total records." });
        }

        const query = `
        SELECT id, title, amount, type, DATE_FORMAT(date, '%Y-%m-%d') AS date 
        FROM transactions 
        WHERE user_id = ? 
        ORDER BY date DESC 
        LIMIT ? OFFSET ?`;

        db.query(query, [userId, limit, offset], (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error fetching transactions." });
            }
            res.json({
                transactions: results,
                totalRecords: totalRecords,
                nextOffset: offset + limit < totalRecords ? offset + limit : null
            });
        });
    });
});

// ✅ Add Transaction Route (Improved)
app.post("/api/v1/transactions", authenticateJWT, (req, res) => {
    const { error } = transactionSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { title, amount, type, date } = req.body;
    const userId = req.user.id;

    const query = "INSERT INTO transactions (user_id, title, amount, type, date) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [userId, title, amount, type, date], (err, results) => {
        if (err) return res.status(500).json({ message: "Error adding transaction." });
        res.status(201).json({ message: "Transaction added successfully!", id: results.insertId });
    });
});

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ message: "An unexpected error occurred." });
});

// ✅ Start the Server (ES Module Friendly)
const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
