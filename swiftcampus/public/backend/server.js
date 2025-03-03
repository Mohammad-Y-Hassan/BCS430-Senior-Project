const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ✅ MySQL Connection Pool
const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST || "swiftcampus-database-1.ccbs4882w413.us-east-1.rds.amazonaws.com",
    user: process.env.DB_USER || "mohassan11714",
    password: process.env.DB_PASS || "Ghazala1!",
    database: process.env.DB_NAME || "swiftcampus_users"
});

// 🔹 Middleware to Verify JWT Token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized - Please log in first." });

    jwt.verify(token, process.env.JWT_SECRET || "your_secret_key", (err, user) => {
        if (err) return res.status(403).json({ error: "Session expired. Please log in again." });
        req.user = user;
        next();
    });
};

// 🟢 **Sign Up API (Allows duplicate emails but ensures unique usernames)**
app.post("/signup", async (req, res) => {
    const { firstname, lastname, username, email, password, gender } = req.body;

    if (!firstname || !lastname || !username || !email || !password || !gender) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    // ✅ Check if username already exists (EMAIL CAN BE DUPLICATE)
    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
        if (err) return res.status(500).json({ error: "Server error. Try again later." });
        if (results.length > 0) return res.status(400).json({ error: "Username is already taken. Choose another one." });

        // ✅ Hash password securely
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (firstname, lastname, username, email, password_hash, gender) VALUES (?, ?, ?, ?, ?, ?)";

        db.query(sql, [firstname, lastname, username, email, hashedPassword, gender], (err) => {
            if (err) return res.status(500).json({ error: "Database error. Try again later." });

            // ✅ Generate JWT Token & Log in User
            const token = jwt.sign({ username, firstname, lastname, email, gender }, process.env.JWT_SECRET || "your_secret_key", { expiresIn: "1h" });

            res.json({ message: "Account created successfully!", token, username, firstname, lastname, email, gender });
        });
    });
});

// 🟢 **Login API**
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: "Server error. Try again later." });
        if (results.length === 0) return res.status(401).json({ error: "No account found with this username. Please sign up first." });

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) return res.status(401).json({ error: "Incorrect password. Please try again." });

        // ✅ Generate JWT Token
        const token = jwt.sign({ username: user.username, firstname: user.firstname, lastname: user.lastname, email: user.email, gender: user.gender }, process.env.JWT_SECRET || "your_secret_key", { expiresIn: "1h" });

        res.json({ message: "Login successful!", token, username: user.username, firstname: user.firstname, lastname: user.lastname, email: user.email, gender: user.gender });
    });
});

// 🟢 **Profile API**
app.get("/profile", authenticateToken, (req, res) => {
    res.json(req.user);
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
