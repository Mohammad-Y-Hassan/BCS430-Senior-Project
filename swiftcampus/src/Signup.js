import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCardWrapper from "./Components/AuthLayout"; 

const Signup = () => {
  const [userData, setUserData] = useState({});
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    const formData = new FormData(e.target);
    const user = Object.fromEntries(formData.entries());

    if (!user.email.endsWith("@farmingdale.edu")) {
      setMessage("Only Farmingdale.edu emails are allowed.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Signup failed. Please try again.");
        return;
      }

      setUserData(user);
      setIsVerifying(true);
      setMessage("OTP sent to your email. Please verify.");
    } catch (err) {
      setMessage("Server error. Please try again later.");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Invalid OTP. Please try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", "rider");
      localStorage.setItem("username", data.username);
      localStorage.setItem("firstname", data.firstname);
      localStorage.setItem("lastname", data.lastname);
      localStorage.setItem("email", data.email);
      localStorage.setItem("gender", data.gender);

      window.dispatchEvent(new Event("storage"));
      navigate("/profile");
    } catch (err) {
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <AuthCardWrapper
      title="Create a New Account!"
    >
      {!isVerifying ? (
        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>First Name</label>
            <input name="firstname" type="text" required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label>Last Name</label>
            <input name="lastname" type="text" required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label>Username</label>
            <input name="username" type="text" required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label>Email</label>
            <input name="email" type="email" required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label>Password</label>
            <input name="password" type="password" required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label>Gender</label>
            <select name="gender" required style={styles.input}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <button type="submit" className="auth-submit" style={styles.submitBtn}>
            Sign Up
          </button>
        </form>
      ) : (
        <div>
          <p>Enter OTP sent to your email:</p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={styles.input}
          />
          <button onClick={handleVerifyOTP} className="auth-submit" style={styles.submitBtn}>
            Verify OTP
          </button>
        </div>
      )}

      {message && (
        <p style={{ color: isVerifying ? "green" : "red", marginTop: "1rem" }}>
          {message}
        </p>
      )}

        <h3 style={{ marginTop: "15px" }}>
            Already have an account? <Link to="/login">Login</Link>
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
};

export default Signup;
