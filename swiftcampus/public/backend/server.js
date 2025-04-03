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

app.post("/orderridefromcampus", async (req, res) => {
    try {
        const { Order_Date, username, location_id, car_id } = req.body;

        if (!location_id || !car_id ) {
            return res.status(400).json({ error: "Location and/or car_id empty"});
        }


        const sql = 'INSERT INTO from_campus_orders (Order_Date, username, location_id, car_id) VALUES (?, ?, ?, ?)';
        db.query(sql, [Order_Date, username, location_id, car_id], (err, result) => {
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

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


//michaels attempt

app.put("/update-profile", (req, res) => {
  const { username, lastname } = req.body;

  db.query(
    "UPDATE users SET lastname = ? WHERE username = ?",
    [lastname, username],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Failed to update profile" });
      }
      res.json({ message: "Profile updated" });
    }
  );
});


const multer = require("multer");
const path = require("path");


// Allow serving uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// API route to handle image upload and save filename to DB
app.post("/upload-profile", upload.single("profileImage"), (req, res) => {
  const { username } = req.body;
  const filename = req.file?.filename;

  if (!filename || !username) {
    return res.status(400).json({ error: "Missing file or username" });
  }

  console.log("✅ Upload request received:");
  console.log("   Username:", username);
  console.log("   File:", req.file);

  const sql = "INSERT INTO test_photos (photo, username, type) VALUES (?, ?, 'profile')";
    db.query(sql, [filename, username], (err) => {
    if (err) {
      console.error("Error inserting profile image into test_photos:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ filename });
  });
});




app.post("/select-profile-image", (req, res) => {
  const { username, filename } = req.body;
  if (!username || !filename) {
    return res.status(400).json({ error: "Missing username or filename" });
  }

  const sql = "INSERT INTO test_photos (photo, username, type) VALUES (?, ?, 'profile')";
  db.query(sql, [filename, username], (err) => {
    if (err) {
      console.error("Error saving selected profile image:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ message: "Profile image recorded", filename });
  });
});




app.get("/user-photo/:username", (req, res) => {
  const { username } = req.params;

  const sql = `
    SELECT photo FROM test_photos
    WHERE username = ?
    ORDER BY photo_id DESC LIMIT 1
  `;

  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (results.length === 0) return res.json({ filename: "default.png" });

    res.json({ filename: results[0].photo });
  });
});



app.get("/latest-profile/:username", (req, res) => {
  const { username } = req.params;

  const sql = `
    SELECT photo FROM test_photos 
    WHERE username = ? AND type = 'profile'
    ORDER BY photo_id DESC 
    LIMIT 1
  `;

  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.json({ photo: "default.png" });

    res.json({ photo: results[0].photo });
  });
});




app.get("/profile-images/:username", (req, res) => {
  const { username } = req.params;

  const sql = `
    SELECT photo FROM test_photos 
    WHERE username = ? AND type = 'profile'
    ORDER BY photo_id DESC
  `;

  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Error fetching profile images:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const photos = results.map((row) => row.photo);
    res.json({ photos });
  });
});


const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads");

app.delete("/delete-profile-image", (req, res) => {
  const { username, filename } = req.body;

  if (!username || !filename) {
    return res.status(400).json({ error: "Missing username or filename" });
  }


  // Delete from DB
  db.query(
    "DELETE FROM test_photos WHERE username = ? AND photo = ? LIMIT 1",
    [username, filename],
    (err, result) => {
      if (err) {
        console.error("Error deleting photo from DB:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Optionally delete file from disk
      const filePath = path.join(uploadsDir, filename);
      fs.unlink(filePath, (fsErr) => {
        if (fsErr && fsErr.code !== "ENOENT") {
          console.error("File deletion error:", fsErr);
        }
        res.json({ message: "Photo deleted" });
      });
    }
  );
});




//Car section, still in developement


const uploadCar = multer({ storage });

app.post("/upload-car-image", uploadCar.single("carImage"), (req, res) => {
  const { username } = req.body;
  const filename = req.file?.filename;

  if (!filename || !username) return res.status(400).json({ error: "Missing file or username" });

  const sql = "INSERT INTO test_photos (photo, username, type) VALUES (?, ?, 'car')";
  db.query(sql, [filename, username], (err) => {
    if (err) {
      console.error("Error inserting car image:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ filename });
  });
});

app.get("/car-photos/:username", (req, res) => {
  const { username } = req.params;

  const sql = `
    SELECT photo FROM test_photos 
    WHERE username = ? AND type = 'car'
    ORDER BY photo_id DESC
  `;

  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Error fetching car images:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const photos = results.map((row) => row.photo);
    res.json({ photos });
  });
});

app.delete("/delete-car-photo", (req, res) => {
  const { username, filename } = req.body;

  const sql = "DELETE FROM test_photos WHERE username = ? AND photo = ?";
  db.query(sql, [username, filename], (err, result) => {
    if (err) {
      console.error("Failed to delete car photo:", err);
      return res.status(500).json({ message: "Failed to delete photo" });
    }
    res.json({ message: "Car photo deleted" });
  });
});
