import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const DriverSignup = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    gender: "M", // Default gender set to Male
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/driver-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Signup failed.");
        return;
      }

      // On success, the server returns { message, username }
      // Store that username in localStorage so Car.js / DriverProfile can use it
      localStorage.setItem("driverUsername", data.username);

      setMessage("Driver signup successful!");
      // Redirect to car details page
      navigate("/car-details");
    } catch (error) {
      console.error("Driver Signup Error:", error);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Driver Signup</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <br />
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <br />
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Username (must match the part before '@' in your email):</label>
          <br />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <br />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Gender:</label>
          <br />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {message && (
        <p style={{ color: message.includes("successful") ? "green" : "red" }}>
          {message}
        </p>
      )}

      {/* ✅ Green Button to go back to Signup.js */}
      <div style={{ marginTop: "20px" }}>
        <Link to="/signup">
          <button
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Go to User Signup
          </button>
        </Link>
      </div>
    </div>
  );
};

export default DriverSignup;
