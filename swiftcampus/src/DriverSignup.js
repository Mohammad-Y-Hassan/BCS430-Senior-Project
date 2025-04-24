import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCardWrapper from "./Components/AuthLayout";

const DriverSignup = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    gender: "M",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/driver-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Signup failed.");
        return;
      }

      localStorage.setItem("driverUsername", data.username);
      localStorage.setItem("driverToken", data.token || "temp-driver-token");
      localStorage.setItem("token", data.token || "temp-driver-token");
      localStorage.setItem("userType", "driver");
      window.dispatchEvent(new Event("storage"));

      setMessage("Driver signup successful!");
      navigate("/car-details");
    } catch (err) {
      console.error("Driver Signup Error:", err);
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <AuthCardWrapper title="Driver Signup">
      <form onSubmit={handleSubmit} style={styles.form}>
            {[
              ["First Name", "firstname"],
              ["Last Name", "lastname"],
              ["Email", "email"],
              ["Username (before '@')", "username"],
              ["Password", "password"],
            ].map(([label, name]) => (
              <div style={styles.inputGroup} key={name}>
                <label>{label}:</label>
                <input
                  type={name === "password" ? "password" : "text"}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            ))}

            <div style={styles.inputGroup}>
              <label>Gender:</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>

            <button type="submit" style={styles.submitBtn}>
              Sign Up
            </button>
          </form>

          {message && (
            <p style={{ marginTop: 10, color: message.includes("success") ? "green" : "red" }}>
              {message}
            </p>
          )}

          <h3 style={{ marginTop: 12 }}>
            Already have an account? <Link to="/driver-login">Login</Link>
          </h3>

  </AuthCardWrapper>
  );
};


// if wrapper doesnt work
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "20px",
  },
  card: {
    backgroundColor: "rgba(0, 73, 64, 0.95)",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
    width: "500px", 
    color: "white",
    textAlign: "center",
  },
  formWrapper: {
    maxWidth: "330px", 
    margin: "0 auto", 
  },
  title: {
    marginBottom: "16px",
    fontSize: "1.8rem",
    fontWeight: "700",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  input: {
    padding: "7px",
    fontSize: "0.95rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginTop: "4px",
  },
  submitBtn: {
    marginTop: "10px",
    padding: "9px",
    fontSize: "1rem",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  altBtn: {
    marginTop: "12px",
    padding: "8px 14px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default DriverSignup;
