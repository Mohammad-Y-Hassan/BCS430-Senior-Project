const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json()); // Ensure request body is parsed correctly

// MySQL Database Connection
const db = mysql.createConnection({
    host: "swiftcampus-database-1.ccbs4882w413.us-east-1.rds.amazonaws.com",
    user: "mohassan11714",
    password: "Ghazala1!",
    database: "swiftcampus_users"
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL Database!");
    }
});

// 🟢 **Sign Up API (Fixed)**
app.post("/signup", async (req, res) => {
    const { firstname, lastname, username, email, password } = req.body;

    if (!firstname || !lastname || !username || !email || !password) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (firstname, lastname, username, email, password_hash) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [firstname, lastname, username, email, hashedPassword], (err, result) => {
        if (err) {
            console.error("Error inserting user:", err);
            res.status(500).json({ error: "Database error: " + err });
        } else {
            console.log("✅ User successfully inserted:", { firstname, lastname, username, email });
            res.json({ message: "User registered successfully!" });
        }
    });
});

// 🟢 **Login API (Fixed)**
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error: " + err });

        if (results.length === 0) return res.status(401).json({ error: "User not found!" });

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) return res.status(401).json({ error: "Incorrect password!" });

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, firstname: user.firstname, lastname: user.lastname, username: user.username, email: user.email },
            "your_secret_key",
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful!", token, username: user.username, firstname: user.firstname, lastname: user.lastname });
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
