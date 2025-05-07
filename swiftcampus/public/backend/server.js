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

  let sql = `
    SELECT car_type, color, License_plate, year, make, model, seats
    FROM car
    WHERE username = ?
    ORDER BY License_plate DESC
    LIMIT 1
  `;

  // If you're not using a column like `id`, order by a unique field like License_plate
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("🚨 Car Query Error:", err);
      return res.status(500).json({ error: "Database error while fetching car info." });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Car info not found." });
    }
    res.status(200).json(results[0]);
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
      const { Order_Date, username_drivers, seat_number, time, origin, destination, town, scheduled_date } = req.body;

      const sql = 'INSERT INTO to_campus_orders (order_date, username_drivers, seat_number, time, is_completed, origin, destination, town, scheduled_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(sql, [Order_Date, username_drivers, seat_number, time, false, origin, destination, town, scheduled_date], (err) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Error inserting data' });
          }
          if (scheduled_date == null || scheduled_date == "") {
            console.error(err);
            return res.status(500).json({ message: 'No Date Scheduled' });
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

// 🟢 TEST FORMAT API
// app.get('/TestFormat', async (req, res) => {
//   try {
//     db.query("SELECT * FROM to_campus_orders Where is_completed = false", async (err, results) => {
//       if (err) {
//         console.error("Database Error:", err);
//         return res.status(500).json({ error: "Database error. Please try again later." });
//       }
//       res.json(results);
//     });
//   } catch (error) {
//     console.error("listdrivers API Error:", error);
//   }
// })

// 🟢  NEW TEST FORMAT API
app.get('/RideAloneOption', async (req, res) => {
  const status = req.query.status;
  const womenonly = req.query.womenonly
  const isWoman = req.query.isWoman
  console.log("WomenOnly: " + womenonly)
  console.log("IsWoman: " + isWoman)
  if (isWoman === "Female") {
    let query = "SELECT * FROM to_campus_orders WHERE is_completed = false ";
    if (womenonly === "Yes") {
      console.log("RideAlone should be Yes: " + status)
      query = ` SELECT to_campus_orders.*
                FROM to_campus_orders
                INNER JOIN driver ON to_campus_orders.username_drivers=driver.username
                where driver.gender = "F" and to_campus_orders.is_completed = false`;
      if (status === "Yes") {
        console.log("RideAlone should be Yes: " + status)
        query += " AND seat_number = 1 and Rider1 is null and Rider2 is null and Rider3 is null and Rider4 is null and Rider5 is null and Rider6 is null";
      }
      if (status === "No") {
        console.log("RideAlone should be No: " + status)
        query += " AND seat_number > 0";
      }
    }
    if (womenonly === "No") {
    if (status === "Yes") {
      console.log("RideAlone should be Yes: " + status)
      query += " AND seat_number = 1 and Rider1 is null and Rider2 is null and Rider3 is null and Rider4 is null and Rider5 is null and Rider6 is null";
    }
    if (status === "No") {
      console.log("RideAlone should be No: " + status)
      query += " AND seat_number > 0";
    }
    }
    console.log("Is a woman: " + query)
    db.query(query, async (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Database error." });
      }
      res.json(results);
    });
  }
  else {
    let query = ` SELECT to_campus_orders.*
                FROM to_campus_orders
                INNER JOIN driver ON to_campus_orders.username_drivers=driver.username
                where driver.perfer_fm = false and to_campus_orders.is_completed = false`;
    if (womenonly === "Yes") {
      console.log("RideAlone should be Yes: " + status)
      query += ` AND where driver.gender = "F"`;
      if (status === "Yes") {
        console.log("RideAlone should be Yes: " + status)
        query += " AND seat_number = 1 and Rider1 is null and Rider2 is null and Rider3 is null and Rider4 is null and Rider5 is null and Rider6 is null";
      }
      if (status === "No") {
        console.log("RideAlone should be No: " + status)
        query += " AND seat_number > 0";
      }
    }
    if (womenonly === "No") {
    if (status === "Yes") {
      console.log("RideAlone should be Yes: " + status)
      query += " AND seat_number = 1 and Rider1 is null and Rider2 is null and Rider3 is null and Rider4 is null and Rider5 is null and Rider6 is null";
    }
    if (status === "No") {
      console.log("RideAlone should be No: " + status)
      query += " AND seat_number > 0";
    }
  }
  console.log("Is not a woman: " + query)
  db.query(query, async (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error." });
    }
    res.json(results);
  });
  }

});


app.get('/ActiveRide', async (req, res) => {
try {        
    const username_riders = req.query.param1;
    console.log("Ser Side:" + username_riders);
    db.query("SELECT * FROM to_campus_orders WHERE is_completed = false && (Rider1 = ? OR Rider2 = ? or Rider3 = ? or Rider4 = ? or Rider5 = ? or Rider6 = ?)",[username_riders,username_riders,username_riders,username_riders,username_riders,username_riders], async (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Database error. Please try again later." });
      }
      else { 
        console.log("Active Ride Results Hit")
        res.json(results);}
    });
  } catch (error) {
    console.error("listdrivers API Error:", error);
  };

})

app.get('/ActiveDrives', async (req, res) => {
  try {        
      const username_drivers = req.query.param1;
      console.log("Ser Side:" + username_drivers);
      db.query("SELECT * FROM to_campus_orders WHERE is_completed = false && username_drivers = ?",[username_drivers], async (err, results) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ error: "Database error. Please try again later." });
        }
        else { 
          console.log("Active Ride Results Hit")
          res.json(results);}
      });
    } catch (error) {
      console.error("listdrivers API Error:", error);
    };
  
  })

app.get('/PastRide', async (req, res) => {
  try {        
      const username_riders = req.query.param1;
      console.log("Past Ride Ser Side:" + username_riders);
      db.query("SELECT * FROM to_campus_orders WHERE is_completed = true && (Rider1 = ? OR Rider2 = ? or Rider3 = ? or Rider4 = ? or Rider5 = ? or Rider6 = ?)",[username_riders,username_riders,username_riders,username_riders,username_riders,username_riders], async (err, results) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ error: "Database error. Please try again later." });
        }
        else { 
          console.log("Past Ride Results Hit")
          res.json(results);}
      });
    } catch (error) {
      console.error("listdrivers API Error:", error);
    };
  
  })
    
// ✅ ORDER RIDE FROM CAMPUS
app.post("/fromcampus-order", async (req, res) => {
  try {
    const { Order_Date, username, location_id, License_plate } = req.body;

    if (!Order_Date || !username || !location_id || !License_plate) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const sql = `
      INSERT INTO from_campus_orders (Order_Date, username, location_id, License_plate)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [Order_Date, username, location_id, License_plate], (err) => {
      if (err) {
        console.error("Insert Error:", err);
        return res.status(500).json({ message: "Error inserting ride from campus." });
      }
      res.status(200).json({ message: "Ride from campus posted successfully!" });
    });
  } catch (error) {
    console.error("fromcampus-order API Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

app.post('/AddingUserToRide', async (req, res) => {
  try {
    const { username_riders, order_id} = req.body;
    const sql = 
    `UPDATE to_campus_orders
    Set Rider6 = CASE WHEN Rider1 IS NOT NULL AND Rider2 IS NOT NULL AND Rider3 IS NOT NULL AND Rider4 IS NOT NULL AND Rider5 IS NOT NULL AND Rider6 IS NULL THEN ? ELSE Rider6 END,
    Rider5 = CASE WHEN Rider1 IS NOT NULL AND Rider2 IS NOT NULL AND Rider3 IS NOT NULL AND Rider4 IS NOT NULL AND Rider5 IS NULL THEN ? ELSE Rider5 END,
    Rider4 = CASE WHEN Rider1 IS NOT NULL AND Rider2 IS NOT NULL AND Rider3 IS NOT NULL AND Rider4 IS NULL THEN ? ELSE Rider4 END,
    Rider3 = CASE WHEN Rider1 IS NOT NULL AND Rider2 IS NOT NULL AND Rider3 IS NULL THEN ? ELSE Rider3 END,
    Rider2 = CASE WHEN Rider1 IS NOT NULL AND Rider2 IS NULL THEN ? ELSE Rider2 END,
    Rider1 = CASE WHEN Rider1 IS NULL THEN ?  ELSE Rider1 END,
    seat_number = seat_number - 1
    WHERE order_id = ?;`;

      db.query(sql, [username_riders,username_riders,username_riders,username_riders,username_riders,username_riders, order_id], (err) => {
        console.log("SQL 1 Hit");
          if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Error inserting data' });
          }
          else {
            res.status(200).json({ message: 'Data inserted successfully' });
          }
      });
  } catch (error) {
      console.error("Signup API Error:", error);
      res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// Comeplete Ride API
// app.post('/CompleteRide', async (req, res) => {
//   try {
//     const { username_riders} = req.body;
//     const sql = 'Update to_campus_orders SET is_completed = true WHERE username_riders = ?';
//     console.log(username_riders);
//       db.query(sql, [username_riders], (err) => {
//           if (err) {
//               console.error(err);
//               return res.status(500).json({ message: 'Error inserting data' });
//           }
//           res.status(200).json({ message: 'Data inserted successfully' });
//       });
//   } catch (error) {
//       console.error("Signup API Error:", error);
//       res.status(500).json({ error: "Server error. Please try again later." });
//   }
// });

// ✅ Final Comeplete Ride API
app.post('/CompleteRide', async (req, res) => {
  try {
    const { username_riders} = req.body;
    const sql = 'Update to_campus_orders SET is_completed = true WHERE Rider1 = ? OR Rider2 = ? or Rider3 = ? or Rider4 = ? or Rider5 = ? or Rider6 = ?';
    console.log(username_riders);
      db.query(sql, [username_riders,username_riders,username_riders,username_riders,username_riders,username_riders], (err) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Error inserting data' });
          }
          res.status(200).json({ message: 'Data inserted successfully' });
      });
    

  } catch (error) {
    console.error("CompleteRide error:", error);
    res.status(500).json({ error: "Server error. Try again later." });
  }
});

// ✅ Final Comeplete Ride API
app.post('/CancelRide', async (req, res) => {
  try {
    const { username_riders, order_id} = req.body;
    const sql = 
    `UPDATE to_campus_orders
    Set Rider6 = CASE WHEN Rider1 != ? AND Rider2 != ? AND Rider3 != ? AND Rider4 != ? AND Rider5 != ? AND Rider6 = ? THEN null ELSE Rider6 END,
    Rider5 = CASE WHEN Rider1 != ? AND Rider2 != ? AND Rider3 != ? AND Rider4 != ? AND Rider5 = ? THEN null ELSE Rider5 END,
    Rider4 = CASE WHEN Rider1 != ? AND Rider2 != ? AND Rider3 != ? AND Rider4 = ? THEN null ELSE Rider4 END,
    Rider3 = CASE WHEN Rider1 != ? AND Rider2 != ? AND Rider3 = ? THEN null ELSE Rider3 END,
    Rider2 = CASE WHEN Rider1 != ? AND Rider2 = ? THEN null ELSE Rider2 END,
    Rider1 = CASE WHEN Rider1 = ? THEN null  ELSE Rider1 END,
    seat_number = seat_number + 1
    WHERE order_id = ?;`;
    console.log(username_riders);
      db.query(sql, [username_riders,username_riders,username_riders,username_riders,username_riders,username_riders,username_riders,
                     username_riders,username_riders,username_riders,username_riders,username_riders,username_riders,username_riders,
                     username_riders,username_riders,username_riders,username_riders,username_riders,username_riders,username_riders,order_id], (err) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Error inserting data' });
          }
          res.status(200).json({ message: 'Data inserted successfully' });
      });
    

  } catch (error) {
    console.error("CompleteRide error:", error);
    res.status(500).json({ error: "Server error. Try again later." });
  }
});


// ✅ FETCH LOCATIONS
app.post("/listlocations", async (req, res) => {
  try {
    db.query("SELECT * FROM location", async (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Database error. Please try again later." });
      }
      res.json(results);
    });
  } catch (error) {
    console.error("listlocations API Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

app.post("/PreferWomen", async (req, res) => {
  try {
    const { username_drivers, perfer_fm} = req.body;
    console.log("perfer_fm-Server Side: " + perfer_fm)
    db.query("update driver set perfer_fm = ? where username = ?",[perfer_fm, username_drivers], async (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Database error. Please try again later." });
      }
      res.json(results);
    });
  } catch (error) {
    console.error("listlocations API Error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

app.get('/GetPreferWomen', async (req, res) => {
  try {        
      const username_drivers = req.query.param1;
      console.log("Ser Side:" + username_drivers);
      db.query("SELECT perfer_fm FROM driver WHERE username = ?",[username_drivers], async (err, results) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ error: "Database error. Please try again later." });
        }
        else { 
          console.log("Active Ride Results Hit")
          res.json(results);}
      });
    } catch (error) {
      console.error("listdrivers API Error:", error);
    };
  
  })

// ✅ Get all ride requests from campus
app.get("/orders/fromcampus", (req, res) => {
  const sql = `
    SELECT Order_ID, Order_Date, username, location_id, License_plate
    FROM from_campus_orders
    ORDER BY Order_ID DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("🚨 Error fetching orders:", err);
      return res.status(500).json({ error: "Database error while fetching ride requests." });
    }

    // ✅ Send back an empty array if there are no results (safe for frontend)
    res.status(200).json(results);
  });
});

// ✅ Get all ride requests from campus
app.get("/ActiveRideCheck", (req, res) => {
  const username = req.query.param1
  const sql = "select * from to_campus_orders where (Rider1 = ? OR Rider2 = ? OR Rider3 = ? OR Rider4 = ? OR Rider5 = ? OR Rider6 = ?) AND is_completed = false";

  db.query(sql,[username, username, username, username, username, username], (err, results) => {
    if (err) {
      console.error("🚨 Error fetching orders:", err);
      return res.status(500).json({ error: "Database error while fetching ride requests." });
    }

    // ✅ Send back an empty array if there are no results (safe for frontend)
    res.status(200).json(results);
  });
});

// ✅ Ratings APIs 

// Submit or update a rider’s 1–5 star rating
app.post('/driver-rating', (req, res) => {
  const { order_id, driver_username, rating } = req.body;
  if (!order_id || !driver_username || ![1,2,3,4,5].includes(rating)) {
    return res.status(400).json({ error: 'order_id, driver_username and rating (1–5) are required.' });
  }
  const sql = `
    INSERT INTO driver_ratings (order_id, driver_username, rating)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY
      UPDATE rating = VALUES(rating), created_at = CURRENT_TIMESTAMP
  `;
  db.query(sql, [order_id, driver_username, rating], err => {
    if (err) return res.status(500).json({ error: 'DB error saving rating.' });
    res.json({ message: 'Rating saved.' });
  });
});

// Return each driver’s average and total count
app.get('/driver-ratings/summary', (req, res) => {
  const sql = `
    SELECT
      driver_username,
      ROUND(AVG(rating),2) AS avg_rating,
      COUNT(*)            AS review_count
    FROM driver_ratings
    GROUP BY driver_username
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error fetching summary.' });
    res.json(results);
  });
});

// Return one driver’s avg & count
app.get('/driver-average-rating/:username', (req, res) => {
  const { username } = req.params;
  const sql = `
    SELECT
      IFNULL(ROUND(AVG(rating),2),0) AS avg_rating,
      COUNT(*)                    AS rating_count
    FROM driver_ratings
    WHERE driver_username = ?
  `;
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Error fetching average rating:", err);
      return res.status(500).json({ error: "Database error." });
    }
    // if no ratings yet, return zeros
    if (results.length === 0) {
      return res.json({ avg_rating: 0, rating_count: 0 });
    }
    res.json(results[0]);
  });
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



app.put("/edit-car", (req, res) => {
  const {
    username,
    car_type,
    color,
    license_plate,
    year,
    make,
    model,
    seats,
  } = req.body;

  if (
    !username ||
    !car_type ||
    !color ||
    !license_plate ||
    !year ||
    !make ||
    !model ||
    !seats
  ) {
    return res.status(400).json({ error: "Missing required car information" });
  }

  const sql = `
    UPDATE car
    SET car_type = ?, color = ?, license_plate = ?, year = ?, make = ?, model = ?, seats = ?
    WHERE username = ?
  `;

  db.query(
    sql,
    [car_type, color, license_plate, year, make, model, seats, username],
    (err, result) => {
      if (err) {
        console.error("Error updating car info:", err);
        return res.status(500).json({ error: "Failed to update car info" });
      }

      res.json({ message: "Car info updated successfully!" });
    }
  );
});
