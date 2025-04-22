import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const DriverLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  localStorage.setItem("isDriver", true);
  localStorage.removeItem("isRider")


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/driver-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Login failed.");
        return;
      }

      // Store the driverUsername so we can use it in the Car component / DriverProfile.
      localStorage.setItem("driverUsername", data.username);

      // Optionally store token if you need it:
      localStorage.setItem("driverToken", data.token);

      setMessage("Driver login successful!");

      // Fire the 'storage' event so the app knows we've updated localStorage
      window.dispatchEvent(new Event("storage"));

      // ✅ Now redirect driver to profile
      navigate("/driver-home");
    } catch (error) {
      console.error("Driver Login Error:", error);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div>
    <div class="signup-card">
      <h2 class="titlefont">Driver Login</h2>
      <div className="blockstyle">
      <form onSubmit={handleSubmit}>
        <div>
          <label class="fieldlabel">Username</label>
          <input
            class="inputfieldlogin"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label class="fieldlabel">Password </label>
          <input
          class="inputfieldlogin"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button class="submitbtn" type="submit">Sign In</button>
      </form>
      {message && (
        <p style={{ color: message.includes("successful") ? "green" : "red" }}>
          {message}
        </p>
      )}

      {/* ✅ Green Button to go back to Login.js */}
      <div style={{ marginTop: "20px" }}>
        <Link to="/login">
          <button
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Go to User Login
          </button>
        </Link>
      </div>
      </div>
      
    </div>
    
    </div>
  );
};

export default DriverLogin;
