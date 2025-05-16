import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCardWrapper from "./Components/AuthLayout"; 

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("process.env.REACT_APP_BACKEND/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Login failed.");
        return;
      }
      setIsSuccess(response.ok);

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userType", "rider");
        localStorage.setItem("username", data.username);
        localStorage.setItem("firstname", data.firstname);
        localStorage.setItem("lastname", data.lastname);
        localStorage.setItem("email", data.email);
        localStorage.setItem("gender", data.gender);

        const username = data.username;

        try {
          const res = await fetch(`process.env.REACT_APP_BACKEND/latest-profile/${username}`);
          const imgData = await res.json();
          const filename = imgData.photo || "default.png";
          localStorage.setItem(`profileImage_${username}`, filename);
        } catch (err) {
          console.error("Error fetching profile image:", err);
          localStorage.setItem(`profileImage_${username}`, "default.png");
        }

        window.dispatchEvent(new Event("storage"));
        navigate("/");
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <AuthCardWrapper title="Login to Your Account">
      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <button className="submitbtn" type="submit" style={styles.submitBtn}>
          Sign In
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 10, color: isSuccess ? "green" : "red" }}>{message}</p>
      )}

      <h3 style={{ marginTop: 15 }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
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
    padding: "10px 20px",
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Login;
