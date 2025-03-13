const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOTP, verifyOTP } = require("./otp");

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ✅ MySQL Connection Pool
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || "swiftcampus-database-1.ccbs4882w413.us-east-1.rds.amazonaws.com",
  user: process.env.DB_USER || "mohassan11714",
  password: process.env.DB_PASS || "Mohammad123!",
  database: process.env.DB_NAME || "swiftcampus_users"
});

// ✅ Check Database Connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database");
  connection.release();
});

// 🔹 Middleware to Verify JWT Token
const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized - Please log in first." });

    jwt.verify(token, process.env.JWT_SECRET || "your_secret_key", (err, user) => {
      if (err) return res.status(403).json({ error: "Session expired. Please log in again." });
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// 🟢 Sign Up API – Step 1: Send OTP
app.post("/signup", async (req, res) => {
  try {
    const { firstname, lastname, username, email, password, gender } = req.body;

    if (!firstname || !lastname || !username || !email || !password || !gender) {
      return res.status(400).json({ error: "All fields are required!" });
    }
    
    // Only allow @farmingdale.edu emails
    if (!email.endsWith("@farmingdale.edu")) {
      return res.status(400).json({ error: "Only Farmingdale.edu emails are allowed for signup." });
    }

    // ✅ Check if username is already taken
    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Server error. Please try again later." });
      }
      if (results.length > 0) {
        return res.status(400).json({ error: "Username is already taken. Please choose another one." });
      }

      try {
        // Send OTP to the provided email
        await sendOTP(email);
        res.json({ message: "OTP sent to email. Please verify to complete signup.", email, otpSent: true });
      } catch (error) {
        console.error("OTP Email Error:", error);
        res.status(500).json({ error: "Failed to send OTP. Please try again." });
      }
    });
  } catch (error) {
    console.error("Signup API Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// 🟢 OTP Verification API – Step 2: Verify OTP and Complete Signup
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, firstname, lastname, username, password, gender } = req.body;

    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required." });

    if (!verifyOTP(email, otp)) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    // OTP verified, continue with signup
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (firstname, lastname, username, email, password_hash, gender) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [firstname, lastname, username, email, hashedPassword, gender], (err) => {
      if (err) {
        console.error("Database Insert Error:", err);
        return res.status(500).json({ error: "Database error. Please try again later." });
      }
      // Generate JWT Token and log in the user
      const token = jwt.sign(
        { username, firstname, lastname, email, gender },
        process.env.JWT_SECRET || "your_secret_key",
        { expiresIn: "1h" }
      );
      
      res.json({ 
        message: "Account verified and created successfully!", 
        token, username, firstname, lastname, email, gender 
      });
    });
  } catch (error) {
    console.error("OTP Verification API Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// 🟢 Login API
app.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.error("Database Query Error:", err);
        return res.status(500).json({ error: "Server error. Please try again later." });
      }
      if (results.length === 0) return res.status(401).json({ error: "No account found with this username. Please sign up first." });

      const user = results[0];

      try {
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) return res.status(401).json({ error: "Incorrect password. Please try again." });

        // Generate JWT Token
        const token = jwt.sign(
          { username: user.username, firstname: user.firstname, lastname: user.lastname, email: user.email, gender: user.gender },
          process.env.JWT_SECRET || "your_secret_key",
          { expiresIn: "1h" }
        );

        res.json({
          message: "Login successful!",
          token, 
          username: user.username, 
          firstname: user.firstname, 
          lastname: user.lastname, 
          email: user.email, 
          gender: user.gender
        });
      } catch (bcryptError) {
        console.error("Password Verification Error:", bcryptError);
        res.status(500).json({ error: "Error verifying password. Please try again later." });
      }
    });
  } catch (error) {
    console.error("Login API Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// 🟢 Profile API
app.get("/profile", authenticateToken, (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Profile API Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// 🟢 Fetch User Data API
app.get("/user/:username", (req, res) => {
  try {
    const { username } = req.params;
    
    db.query("SELECT username, firstname, lastname, email, gender FROM users WHERE username = ?", [username], (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Database error. Please try again later." });
      }
      if (results.length === 0) return res.status(404).json({ error: "User not found." });
      res.json(results[0]);
    });
  } catch (error) {
    console.error("User Fetch API Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
