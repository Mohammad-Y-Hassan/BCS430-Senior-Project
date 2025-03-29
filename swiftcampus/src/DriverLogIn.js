import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DriverLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
      navigate("/driver-profile");
    } catch (error) {
      console.error("Driver Login Error:", error);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Driver Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
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
        <button type="submit">Login</button>
      </form>
      {message && (
        <p style={{ color: message.includes("successful") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default DriverLogin;
