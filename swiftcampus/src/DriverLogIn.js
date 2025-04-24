import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCardWrapper from "./Components/AuthLayout";

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

      localStorage.setItem("userType", "driver");
      localStorage.setItem("token", data.token);
      localStorage.setItem("driverUsername", data.username);
      localStorage.setItem("driverToken", data.token);

      // Fetch latest profile image
      fetch(`http://localhost:5000/latest-profile/${data.username}`)
        .then((res) => res.json())
        .then((imgData) => {
          const imageFile = imgData.photo || "default.png";
          localStorage.setItem(`profileImage_${data.username}`, imageFile);
          localStorage.setItem("profileImage", imageFile);
          window.dispatchEvent(new Event("storage"));
        })
        .catch((err) => {
          console.error("Failed to fetch profile image:", err);
          localStorage.setItem(`profileImage_${data.username}`, "default.png");
        });

      setMessage("Driver login successful!");
      window.dispatchEvent(new Event("storage"));
      navigate("/driver-home");
    } catch (error) {
      console.error("Driver Login Error:", error);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <AuthCardWrapper title="Driver Login">
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.submitBtn}>Sign In</button>
      </form>

      {message && (
        <p style={{ marginTop: "10px", color: message.includes("success") ? "lightgreen" : "red" }}>
          {message}
        </p>
      )}

      <h3 style={{ marginTop: "15px" }}>
        Don't have an account? <Link to="/driver-signup">Sign up</Link>
      </h3>

    </AuthCardWrapper>
  );
};

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    fontSize: "1rem",
    fontWeight: "500",
  },
  input: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    marginTop: "5px",
  },
  submitBtn: {
    marginTop: "10px",
    padding: "10px",
    fontSize: "1rem",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  altBtn: {
    marginTop: "15px",
    padding: "8px 14px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default DriverLogin;
