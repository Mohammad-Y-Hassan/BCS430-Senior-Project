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
// ✅ Driver Sign Up API
app.post("/driver-signup", async (req, res) => {
  try {
    // Now include username from req.body
    const { firstname, lastname, email, username, password, gender } = req.body;

    // 1) Check required fields
    if (!firstname || !lastname || !email || !username || !password || !gender) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // 2) Restrict to Farmingdale emails
    if (!email.endsWith("@farmingdale.edu")) {
      return res.status(400).json({ error: "Only @farmingdale.edu emails allowed." });
    }

    // 3) Validate that the provided username matches the part before '@'
    const emailPrefix = email.split("@")[0];
    if (username !== emailPrefix) {
      return res.status(400).json({
        error: "Username must match the part before '@' in your email."
      });
    }

    db.query("SELECT * FROM driver WHERE username = ?", [username], async (err, results) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ error: "Server error." });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: "Username already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = `
        INSERT INTO driver (username, firstname, lastname, email, password_hash, gender)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(sql, [username, firstname, lastname, email, hashedPassword, gender], (err) => {
        if (err) {
          console.error("DB Insert Error:", err);
          return res.status(500).json({ error: "Database error." });
        }

        // ✅ Return the same JSON as before:
        return res.status(200).json({
          message: "Driver signed up successfully!",
          username
        });
      });
    });
  } catch (error) {
    console.error("Driver Signup Error:", error);
    res.status(500).json({ error: "Server error." });
  }
});

// ✅ Driver Login API
app.post("/driver-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required." });
    }

    const sql = "SELECT * FROM driver WHERE username = ?";
    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Driver not found." });
      }

      const driver = results[0];
      const match = await bcrypt.compare(password, driver.password_hash);

      if (!match) {
        return res.status(401).json({ error: "Invalid password." });
      }

      // Create JWT token as before
      const token = jwt.sign({ username: driver.username }, process.env.JWT_SECRET || "secret", {
        expiresIn: "1h"
      });

      // ✅ ADDED: include driver’s name, email, gender in the response
      // so the frontend can store/display the same data as after signup.
      return res.status(200).json({
        message: "Driver login successful",
        token,
        username,
        firstname: driver.firstname,
        lastname: driver.lastname,
        email: driver.email,
        gender: driver.gender
      });
    });
  } catch (error) {
    console.error("Driver Login Error:", error);
    res.status(500).json({ error: "Server error." });
  }
});

// ✅ Car Info API - Add car details
app.post("/add-car", (req, res) => {
  const { username, car_type, color, License_plate, year, make, model, seats } = req.body;

  console.log("Car Info Received:", req.body);

  if (!username || !License_plate || !seats) {
    return res.status(400).json({ error: "Required fields missing." });
  }

  const sql = `
    INSERT INTO car (username, car_type, color, License_plate, year, make, model, seats)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [username, car_type, color, License_plate, year, make, model, seats], (err) => {
    if (err) {
      console.error("🚨 Car Insert Error:", err);
      return res.status(500).json({ error: "Database error while inserting car info." });
    }

    res.status(200).json({ message: "Car info added successfully!" });
  });
});

// ✅ Driver Profile API - GET driver info by username
app.get("/driver/:username", (req, res) => {
  const { username } = req.params;

  const sql = `SELECT username, firstname, lastname, email, gender FROM driver WHERE username = ?`;

  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Driver Query Error:", err);
      return res.status(500).json({ error: "Database error while fetching driver info." });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Driver not found." });
    }
    res.status(200).json(results[0]);
  });
});

// ✅ Car Info API - GET the latest car info for a driver by username
app.get("/car/:username", (req, res) => {
  const { username } = req.params;

  // Keep the original query text in a variable
  let sql = `
    SELECT car_type, color, License_plate, year, make, model, seats
    FROM car
    WHERE username = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  // 1) Check if the 'id' column actually exists in the 'car' table.
  db.query("SHOW COLUMNS FROM car LIKE 'id'", (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Car Column Check Error:", checkErr);
      return res.status(500).json({ error: "Database error while checking car table columns." });
    }

    // 2) If there's NO 'id' column in 'car', remove ORDER BY and LIMIT
    if (checkResults.length === 0) {
      sql = `
        SELECT car_type, color, License_plate, year, make, model, seats
        FROM car
        WHERE username = ?
      `;
    }

    // 3) Now run whichever SQL we ended up with
    db.query(sql, [username], (err, results) => {
      if (err) {
        console.error("Car Query Error:", err);
        return res.status(500).json({ error: "Database error while fetching car info." });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Car info not found." });
      }
      res.status(200).json(results[0]);
    });
  });
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

app.post("/orderridetocampus", async (req, res) => {
  try {
      const { Order_Date, username_drivers, seat_number, time, origin, destination } = req.body;

      const sql = 'INSERT INTO to_campus_orders (order_date, username_drivers, seat_number, time, origin, destination) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(sql, [Order_Date, username_drivers, seat_number, time, origin, destination], (err) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Error inserting data' });
          }
          res.status(200).json({ message: 'Data inserted successfully' });
      });
  } catch (error) {
      console.error("Signup API Error:", error);
      res.status(500).json({ error: "Server error. Please try again later." });
  }
});

app.post("/listlocations", async (req, res) => {
  try {
    db.query("SELECT * FROM location", async (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Database error. Please try again later." });
      }
      res.json(results[0]);
    });
  } catch (error) {
    console.error("listdrivers API Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

app.get('/TestFormat', async (req, res) => {
  try {
    db.query("SELECT * FROM to_campus_orders", async (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Database error. Please try again later." });
      }
      res.json(results);
    });
  } catch (error) {
    console.error("listdrivers API Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
